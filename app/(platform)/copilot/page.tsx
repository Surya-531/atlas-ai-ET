"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Sparkles, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import type { CopilotMessage } from "@/lib/types";

const STARTER_QUESTIONS = [
  "Why is Compressor C-102 at risk?",
  "What caused the 2022 bearing failure?",
  "Which compliance items are expiring soon?",
  "What maintenance is due on Pump P-203?",
];

function uniqueMessages(messages: CopilotMessage[]) {
  const seen = new Set<string>();
  return messages.filter((message) => {
    if (seen.has(message.id)) return false;
    seen.add(message.id);
    return true;
  });
}

export default function CopilotPage() {
  return (
    <Suspense fallback={null}>
      <CopilotInner />
    </Suspense>
  );
}

function CopilotInner() {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const optimisticIdRef = useRef(0);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch("/api/copilot").then((r) => r.json()).then((d) => setMessages(uniqueMessages(d.messages ?? [])));
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) send(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(question: string) {
    if (!question.trim() || sending) return;
    const optimisticId = `temp-${Date.now()}-${optimisticIdRef.current++}`;
    setSending(true);
    setInput("");
    setMessages((prev) => uniqueMessages([
      ...prev,
      { id: optimisticId, role: "user", content: question, createdAt: new Date().toISOString() },
    ]));
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => m.id !== optimisticId);
        return uniqueMessages([...withoutOptimistic, data.userMessage, data.message].filter(Boolean));
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <TopBar title="AI Copilot" description="Ask about any asset, incident, or regulation — grounded in GraphRAG." />
      <div className="flex flex-col h-[calc(100vh-73px)]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-5">
          {messages.length === 0 && (
            <div className="panel p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} style={{ color: "var(--accent)" }} />
                <span className="font-display text-sm">Ask ATLAS anything about your operation</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-left text-xs panel-2 px-3 py-2.5 hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              {m.role === "user" ? (
                <div className="max-w-lg rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm" style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>
                  {m.content}
                </div>
              ) : (
                <div className="max-w-2xl w-full panel p-4">
                  <p className="text-sm whitespace-pre-line mb-3">{m.content}</p>

                  {typeof m.confidence === "number" && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-1.5 flex-1 rounded-full bg-[var(--border)] overflow-hidden max-w-[140px]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${m.confidence}%`,
                            background: m.confidence > 70 ? "var(--status-healthy)" : m.confidence > 40 ? "var(--status-warning)" : "var(--status-critical)",
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-[var(--muted)]">{m.confidence}% confidence</span>
                    </div>
                  )}

                  {m.citations && m.citations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {m.citations.map((c, i) => (
                        <span
                          key={`${m.id}-${c.chunkId}-${i}`}
                          title={c.snippet}
                          className="flex items-center gap-1 text-[10px] font-mono rounded-full px-2 py-1"
                          style={{ background: "var(--data-soft)", color: "var(--data)" }}
                        >
                          <BookOpen size={9} /> {c.documentTitle.slice(0, 32)}
                        </span>
                      ))}
                    </div>
                  )}

                  {m.reasoning && (
                    <button
                      onClick={() => setExpandedReasoning(expandedReasoning === m.id ? null : m.id)}
                      className="flex items-center gap-1 text-[10px] font-mono uppercase text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      Reasoning summary {expandedReasoning === m.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                  )}
                  {expandedReasoning === m.id && m.reasoning && (
                    <ul className="mt-2 space-y-1 text-xs text-[var(--muted)]">
                      {m.reasoning.map((r, i) => (
                        <li key={i}>· {r}</li>
                      ))}
                    </ul>
                  )}

                  {m.suggested && m.suggested.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.suggested.map((s, i) => (
                        <button
                          key={`${m.id}-${s}-${i}`}
                          onClick={() => send(s)}
                          className="text-[10px] hairline rounded-full px-2.5 py-1 hover:bg-[var(--surface-hover)]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="panel p-4 text-xs text-[var(--muted)] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full pulse-dot" style={{ background: "var(--data)" }} />
                Retrieving evidence and traversing the knowledge graph…
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border)] p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="max-w-4xl mx-auto flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about an asset, incident, or regulation…"
              className="flex-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] px-4 py-3 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={sending}
              className="rounded-lg px-4 flex items-center justify-center disabled:opacity-50"
              style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
