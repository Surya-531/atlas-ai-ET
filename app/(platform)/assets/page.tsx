"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Asset } from "@/lib/types";

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/assets").then((r) => r.json()).then((d) => setAssets(d.assets));
  }, []);

  const filtered = filter === "all" ? assets : assets.filter((a) => a.status === filter);

  return (
    <>
      <TopBar title="Asset Explorer" description="Every machine, with a digital profile, history, and AI recommendations." />
      <div className="p-6 max-w-7xl space-y-4">
        <div className="flex gap-2">
          {["all", "healthy", "warning", "critical"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-xs rounded-full px-3 py-1.5 capitalize"
              style={{
                background: filter === f ? "var(--accent-soft)" : "transparent",
                color: filter === f ? "var(--accent)" : "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((asset) => (
            <Link key={asset.id} href={`/assets/${asset.id}`} className="panel p-5 hover:bg-[var(--surface-hover)] transition-colors block">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-[var(--muted)]">{asset.code}</span>
                <StatusBadge status={asset.status} pulse={asset.status === "critical"} />
              </div>
              <h3 className="font-display text-sm font-medium mb-1">{asset.name}</h3>
              <p className="text-xs text-[var(--muted)] mb-4">{asset.department} · {asset.location}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[var(--muted)] font-mono text-[10px] uppercase mb-0.5">Risk</div>
                  <div className="font-mono">{asset.riskScore}/100</div>
                </div>
                <div>
                  <div className="text-[var(--muted)] font-mono text-[10px] uppercase mb-0.5">RUL</div>
                  <div className="font-mono">{asset.remainingUsefulLifeDays}d</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
