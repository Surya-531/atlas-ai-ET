// LLM layer - calls OpenRouter (OpenAI-compatible chat completions) when
// OPENROUTER_API_KEY is set. The model is configurable via env, so this can
// point at Claude, Gemini, DeepSeek, Llama, or Qwen without a code change.
// If no key is configured, callLLM falls back to a deterministic composer so
// every feature still returns a grounded response offline.

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

function offlineCompose(messages: ChatMessage[]): string {
  const system = messages.find((m) => m.role === "system")?.content || "";
  const user = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const systemLower = system.toLowerCase();

  const contextMatch = user.match(/CONTEXT:([\s\S]*?)(?:QUESTION:|TASK:|$)/i);
  const context = contextMatch?.[1]?.trim() ?? "";
  const questionMatch = user.match(/(?:QUESTION|TASK):([\s\S]*)/i);
  const question = questionMatch?.[1]?.trim() ?? user.slice(0, 200);

  const contextLines = context
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6);

  if (systemLower.includes("root cause analysis agent")) {
    const evidenceLine = contextLines.find((line) => line.toLowerCase().startsWith("evidence:"));
    const factorsLine = contextLines.find((line) => line.toLowerCase().startsWith("contributing factors"));
    return [
      "Based on the maintenance and inspection evidence retrieved, the most consistent explanation is a progressive mechanical degradation pattern rather than a single sudden failure.",
      evidenceLine ? evidenceLine.slice(0, 260) : "",
      factorsLine ? factorsLine.slice(0, 200) : "",
      "CORRECTIVE: Replace or repair the affected component before returning the asset to service, verified against OEM tolerance thresholds.",
      "PREVENTIVE: Add this failure mode to the preventive maintenance checklist and shorten the inspection interval for this asset class.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (systemLower.includes("maintenance intelligence agent")) {
    const riskLine = contextLines.find((line) => line.toLowerCase().startsWith("risk score"));
    const recentLine = contextLines.find((line) => line.toLowerCase().startsWith("recent maintenance"));
    return [
      riskLine
        ? `${riskLine.replace(/Risk score: /i, "Given a risk score of ")} Recommend prioritizing an inspection before the next production run.`
        : "Recommend scheduling an inspection based on current telemetry trends.",
      recentLine ? recentLine : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (systemLower.includes("executive")) {
    return [
      `Operational summary: ${contextLines[0] ?? "asset health is broadly stable with isolated risk pockets."}`,
      contextLines[1] ? `Notable trend: ${contextLines[1]}` : "",
      "Recommendation: prioritize the highest risk-score assets for the next maintenance window and close open compliance gaps first.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (!contextLines.length) {
    return `I couldn't find grounded evidence for "${question}" in the indexed knowledge base yet. Try uploading a related document, or ask about an asset that already has documents and maintenance history linked.`;
  }

  return composeCopilotAnswer(question, contextLines);
}

function composeCopilotAnswer(question: string, contextLines: string[]): string {
  const lowerQuestion = question.toLowerCase();
  const relevantLines = contextLines.slice(0, 5);

  if (lowerQuestion.includes("why") || lowerQuestion.includes("risk")) {
    const riskSignals = relevantLines.filter((line) =>
      /risk|vibration|temperature|abnormal|lubrication|skipped|failure|telemetry|remaining useful life/i.test(line)
    );
    const evidence = riskSignals.length ? riskSignals : relevantLines.slice(0, 3);
    return [
      `The main risk indicators are ${evidence.join(" ")}`,
      "Taken together, these point to elevated operational risk that should be checked before the next high-load run.",
    ].join("\n\n");
  }

  if (lowerQuestion.includes("maintenance") || lowerQuestion.includes("due")) {
    const maintenanceLines = relevantLines.filter((line) =>
      /maintenance|inspection|lubrication|interval|replace|schedule|due|service/i.test(line)
    );
    return [
      `${maintenanceLines[0] ?? relevantLines[0]}`,
      maintenanceLines[1] ? `Related evidence: ${maintenanceLines.slice(1, 3).join(" ")}` : "",
      "My recommendation is to prioritize the cited maintenance action and verify the latest asset readings before closing it.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (lowerQuestion.includes("compliance") || lowerQuestion.includes("expir")) {
    const complianceLines = relevantLines.filter((line) =>
      /compliance|regulation|certificate|statutory|iso|osha|oisd|due|expir/i.test(line)
    );
    return [
      `${complianceLines[0] ?? relevantLines[0]}`,
      complianceLines[1] ? `Additional supporting context: ${complianceLines.slice(1, 3).join(" ")}` : "",
      "Treat any expired or near-due item as a priority because the cited evidence is tied to audit readiness.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    `${relevantLines[0]}`,
    relevantLines.length > 1 ? `Supporting evidence: ${relevantLines.slice(1, 3).join(" ")}` : "",
    `Based on the retrieved sources, that is the grounded answer I can provide for "${question}".`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
