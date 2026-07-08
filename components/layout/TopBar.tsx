"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Radio } from "lucide-react";

export function TopBar({ title, description }: { title: string; description?: string }) {
  const [liveLLM, setLiveLLM] = useState<boolean | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetch("/api/copilot")
      .then((r) => r.json())
      .then((d) => setLiveLLM(!!d.liveLLM))
      .catch(() => setLiveLLM(false));
  }, []);

  async function reseed() {
    setSeeding(true);
    await fetch("/api/seed", { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="sticky top-0 z-10 backdrop-blur bg-[var(--background)]/80 border-b border-[var(--border)]">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="font-display text-xl font-medium">{title}</h1>
          {description && <p className="text-sm text-[var(--muted)] mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div
            className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-mono"
            style={{
              background: liveLLM ? "var(--status-healthy-soft)" : "var(--data-soft)",
              color: liveLLM ? "var(--status-healthy)" : "var(--data)",
            }}
            title={liveLLM ? "Live OpenRouter model configured" : "Offline reasoning composer (no OPENROUTER_API_KEY)"}
          >
            <Radio size={12} />
            {liveLLM === null ? "Checking model…" : liveLLM ? "OpenRouter live" : "Offline demo mode"}
          </div>
          <button
            onClick={reseed}
            disabled={seeding}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={seeding ? "animate-spin" : ""} />
            Reset demo data
          </button>
        </div>
      </div>
    </div>
  );
}
