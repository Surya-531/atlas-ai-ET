import { listChunks, listDocuments, listEntities, listRelationships, getAsset } from "./store";
import { embed, cosineSimilarity } from "./embeddings";
import type { Citation } from "./types";

export interface RetrievalResult {
  citations: Citation[];
  graphContext: string[];
  contextText: string;
}

/**
 * GraphRAG retriever: combines dense vector similarity over document chunks
 * (the RAG half) with one hop of knowledge-graph traversal from any entity
 * mentioned in the query (the Graph half), so the copilot can answer
 * questions like "why is Compressor C-102 at risk?" using both the raw
 * text evidence AND the structured relationships (technician, regulation,
 * department) linked to that asset.
 */
function keywordTokens(text: string): string[] {
  return [...new Set((text.toLowerCase().match(/[a-z]{4,}|\b[a-z]{1,3}-\d{2,4}\b/gi) ?? []).map((t) => t.toLowerCase()))];
}

export async function retrieve(query: string, topK = 5): Promise<RetrievalResult> {
  const queryEmbedding = await embed(query);
  const chunks = listChunks();
  const docs = listDocuments();
  const queryKeywords = keywordTokens(query);

  const scored = chunks
    .map((chunk) => {
      const cosine = cosineSimilarity(queryEmbedding, chunk.embedding);
      const chunkLower = chunk.text.toLowerCase();
      // Literal keyword / asset-code overlap — the offline hashing embedder is
      // bag-of-words and can under-rank exact asset-code matches, so this
      // keyword boost (esp. codes like "C-102") keeps retrieval grounded.
      const overlap = queryKeywords.filter((k) => chunkLower.includes(k)).length;
      const score = cosine * 0.5 + Math.min(overlap * 0.12, 0.5);
      return { chunk, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((s) => s.score > 0.03);

  const citations: Citation[] = scored.map(({ chunk, score }) => {
    const doc = docs.find((d) => d.id === chunk.documentId);
    return {
      documentId: chunk.documentId,
      documentTitle: doc?.title ?? "Unknown document",
      chunkId: chunk.id,
      snippet: chunk.text.slice(0, 220),
      score: Math.round(score * 1000) / 1000,
    };
  });

  // Graph traversal: find entities whose label appears in the query, then
  // pull their 1-hop neighborhood for structured context.
  const entities = listEntities();
  const relationships = listRelationships();
  const lowerQuery = query.toLowerCase();

  const matchedEntities = entities.filter((e) => lowerQuery.includes(e.label.toLowerCase()));
  const graphContext: string[] = [];

  for (const entity of matchedEntities) {
    const related = relationships.filter(
      (r) => r.sourceId === entity.id || r.targetId === entity.id
    );
    for (const rel of related.slice(0, 6)) {
      const otherId = rel.sourceId === entity.id ? rel.targetId : rel.sourceId;
      const other = entities.find((e) => e.id === otherId);
      if (!other) continue;
      graphContext.push(`${entity.label} —[${rel.type}]→ ${other.label}`);
    }

    if (entity.type === "asset" && entity.refId) {
      const asset = getAsset(entity.refId);
      if (asset) {
        graphContext.push(
          `${asset.name} (${asset.code}) telemetry: risk score ${asset.riskScore}/100, ` +
            `vibration trend ${asset.vibrationTrendPct > 0 ? "+" : ""}${asset.vibrationTrendPct}%, ` +
            `temperature trend ${asset.temperatureTrendPct > 0 ? "+" : ""}${asset.temperatureTrendPct}%, ` +
            `remaining useful life ~${asset.remainingUsefulLifeDays} days, status ${asset.status}.`
        );
      }
    }
  }

  const contextText = [
    ...citations.map((c, i) => `[${i + 1}] (${c.documentTitle}) ${c.snippet}`),
    ...graphContext.map((g) => `[graph] ${g}`),
  ].join("\n");

  return { citations, graphContext: [...new Set(graphContext)], contextText };
}
