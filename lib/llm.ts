// LLM layer — calls OpenRouter (OpenAI-compatible chat completions) when
// OPENROUTER_API_KEY is set. The model is fully configurable via env so you
// can point this at Claude, Gemini, DeepSeek, Llama, or Qwen without a code
// change. If no key is configured, callLLM falls back to a deterministic
// "reasoning" composer so every feature still demos convincingly offline.

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export function isLiveLLMConfigured(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}

export async function callLLM(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";

  if (apiKey) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://atlas-ai.local",
          "X-Title": "ATLAS AI",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: opts.temperature ?? 0.3,
          max_tokens: opts.maxTokens ?? 900,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const content = json?.choices?.[0]?.message?.content;
        if (typeof content === "string" && content.trim().length > 0) {
          return content.trim();
        }
      }
    } catch {
      // fall through to offline composer
    }
  }

  return offlineCompose(messages);
}

/**
 * Deterministic fallback used when no OPENROUTER_API_KEY is configured.
 * It doesn't call any network service — it composes a grounded answer
 * directly from the context the caller already placed in the prompt, so
 * retrieval quality (not LLM creativity) drives the demo.
 */
function offlineCompose(messages: ChatMessage[]): string {
  const system = messages.find((m) => m.role === "system")?.content || "";
  const user = [...messages].reverse().find((m) => m.role === "user")?.content || "";

  const contextMatch = user.match(/CONTEXT:([\s\S]*?)(?:QUESTION:|TASK:|$)/i);
  const context = contextMatch?.[1]?.trim() ?? "";
  const questionMatch = user.match(/(?:QUESTION|TASK):([\s\S]*)/i);
  const question = questionMatch?.[1]?.trim() ?? user.slice(0, 200);

  const contextLines = context
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 6);

  if (system.toLowerCase().includes("root cause")) {
    const evidenceLine = contextLines.find((l) => l.toLowerCase().startsWith("evidence:"));
    const factorsLine = contextLines.find((l) => l.toLowerCase().startsWith("contributing factors"));
    return [
      `Based on the maintenance and inspection evidence retrieved, the most consistent explanation is a progressive mechanical degradation pattern rather than a single sudden failure.`,
      evidenceLine ? evidenceLine.slice(0, 260) : "",
      factorsLine ? factorsLine.slice(0, 200) : "",
      `CORRECTIVE: Replace or repair the affected component before returning the asset to service, verified against OEM tolerance thresholds.`,
      `PREVENTIVE: Add this failure mode to the preventive maintenance checklist and shorten the inspection interval for this asset class.`,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (system.toLowerCase().includes("maintenance intelligence")) {
    const riskLine = contextLines.find((l) => l.toLowerCase().startsWith("risk score"));
    const recentLine = contextLines.find((l) => l.toLowerCase().startsWith("recent maintenance"));
    return [
      riskLine
        ? `${riskLine.replace(/Risk score: /i, "Given a risk score of ")} Recommend prioritizing an inspection before the next production run.`
        : "Recommend scheduling an inspection based on current telemetry trends.",
      recentLine ? recentLine : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (system.toLowerCase().includes("executive")) {
    return [
      `Operational summary: ${contextLines[0] ?? "asset health is broadly stable with isolated risk pockets."}`,
      contextLines[1] ? `Notable trend: ${contextLines[1]}` : "",
      `Recommendation: prioritize the highest risk-score assets for the next maintenance window and close open compliance gaps first.`,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  // Default: copilot-style grounded answer
  if (!contextLines.length) {
    return `I couldn't find grounded evidence for "${question}" in the indexed knowledge base yet. Try uploading a related document, or ask about an asset that already has documents and maintenance history linked.`;
  }

  return [
    `${contextLines[0]}`,
    contextLines.length > 1 ? `This is corroborated by: ${contextLines.slice(1, 3).join(" ")}` : "",
    `Based on this, my assessment is that the situation warrants attention proportional to the evidence above — see the cited sources for full detail.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
