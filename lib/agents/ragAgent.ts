import { retrieve } from "../graphrag";
import { callLLM, isLiveLLMConfigured } from "../llm";
import type { Citation } from "../types";

export interface CopilotAnswer {
  answer: string;
  citations: Citation[];
  confidence: number;
  reasoning: string[];
  suggested: string[];
}

const SYSTEM_PROMPT = `You are the ATLAS AI Industrial Copilot, an expert reasoning engine for
industrial operations (maintenance, reliability, compliance, root cause analysis).
Answer ONLY using the CONTEXT provided — it comes from a GraphRAG retrieval over the
organization's documents and knowledge graph. If the context doesn't support an answer,
say so plainly. Be concise, specific, and reference asset codes / dates when present.
Never invent sources. Write 3-6 sentences.`;

export async function answerQuestion(question: string, history: string[] = []): Promise<CopilotAnswer> {
  const retrieval = await retrieve(question, 6);

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: `${history.length ? `RECENT CHAT:\n${history.slice(-6).join("\n")}\n\n` : ""}CONTEXT:\n${retrieval.contextText || "(no matching context found)"}\n\nQUESTION: ${question}`,
    },
  ];

  const answer = await callLLM(messages, { temperature: 0.25 });

  const avgScore =
    retrieval.citations.length > 0
      ? retrieval.citations.reduce((s, c) => s + c.score, 0) / retrieval.citations.length
      : 0;
  const graphBoost = retrieval.graphContext.length > 0 ? 0.15 : 0;
  const liveBoost = isLiveLLMConfigured() ? 0.05 : 0;
  const confidence = Math.max(
    5,
    Math.min(98, Math.round((avgScore * 180 + graphBoost * 100 + liveBoost * 100) * 10) / 10)
  );

  const reasoning = [
    `Retrieved ${retrieval.citations.length} relevant document chunk(s) via vector similarity search.`,
    retrieval.graphContext.length
      ? `Traversed the knowledge graph and found ${retrieval.graphContext.length} related fact(s) (asset telemetry, technicians, regulations).`
      : `No matching entities found in the knowledge graph for this query.`,
    isLiveLLMConfigured()
      ? `Synthesized the answer with the configured OpenRouter model.`
      : `Synthesized the answer with the offline reasoning composer (no OPENROUTER_API_KEY configured).`,
  ];

  const suggested = buildSuggestions(question, retrieval.citations);

  return { answer, citations: retrieval.citations, confidence, reasoning, suggested };
}

function buildSuggestions(question: string, citations: Citation[]): string[] {
  const base = [
    "What maintenance is due in the next 30 days?",
    "Which assets have the highest risk score right now?",
    "Are there any expiring compliance certificates?",
  ];
  if (citations[0]) {
    base.unshift(`Show me everything linked to "${citations[0].documentTitle}"`);
  }
  return base.slice(0, 4);
}
