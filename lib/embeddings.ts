// Embeddings layer.
//
// Demo mode (default): a deterministic, offline hashing-trick vectorizer.
// It's not a neural embedding model, but it gives meaningful cosine
// similarity for the kind of keyword-dense industrial text this platform
// ingests (asset codes, part names, technician names, regulation IDs) —
// which means GraphRAG retrieval works with zero API keys.
//
// Production mode: set EMBEDDINGS_API_URL + EMBEDDINGS_API_KEY to any
// OpenAI-compatible /embeddings endpoint (OpenAI, a hosted BGE-M3 server,
// Voyage, etc.) and this module will call it instead. This is the drop-in
// slot for BAAI BGE-M3 described in the architecture doc.

const DIM = 384;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function hash(token: string): number {
  let h = 2166136261;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function localEmbed(text: string): number[] {
  const vec = new Array(DIM).fill(0);
  const tokens = tokenize(text);
  for (const token of tokens) {
    const idx = hash(token) % DIM;
    vec[idx] += 1;
    // lightly weight bigrams so "P-203" style codes and phrases matter
    vec[(idx * 31 + 7) % DIM] += 0.5;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

async function remoteEmbed(text: string): Promise<number[] | null> {
  const url = process.env.EMBEDDINGS_API_URL;
  const key = process.env.EMBEDDINGS_API_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.EMBEDDINGS_MODEL || "bge-m3",
        input: text,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const vector = json?.data?.[0]?.embedding;
    return Array.isArray(vector) ? vector : null;
  } catch {
    return null;
  }
}

export async function embed(text: string): Promise<number[]> {
  const remote = await remoteEmbed(text);
  return remote ?? localEmbed(text);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
