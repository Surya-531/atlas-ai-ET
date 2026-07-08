"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PlantTwin } from "@/components/twin/PlantTwin";
import type { Asset } from "@/lib/types";

export default function TwinPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selected, setSelected] = useState<Asset | null>(null);

  useEffect(() => {
    fetch("/api/assets").then((r) => r.json()).then((d) => setAssets(d.assets));
  }, []);

  return (
    <>
      <TopBar title="Digital Twin" description="Interactive 2D plant layout — click any asset for a live health snapshot." />
      <div className="p-6 max-w-7xl grid md:grid-cols-4 gap-4">
        <div className="md:col-span-3 panel p-4">
          <PlantTwin assets={assets} onSelect={setSelected} selectedId={selected?.id} />
          <div className="flex gap-4 mt-3 px-2">
            {[
              { label: "Healthy", color: "#34d399" },
              { label: "Warning", color: "#f5a524" },
              { label: "Critical", color: "#fb5b5b" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} /> {s.label}
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-5">
          <h3 className="font-display text-sm font-medium mb-4">Asset Snapshot</h3>
          {selected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[var(--muted)]">{selected.code}</span>
                <StatusBadge status={selected.status} pulse={selected.status === "critical"} />
              </div>
              <div className="text-sm">{selected.name}</div>
              <div className="scan-divider" />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><div className="text-[var(--muted)] font-mono text-[10px] uppercase">Risk</div>{selected.riskScore}/100</div>
                <div><div className="text-[var(--muted)] font-mono text-[10px] uppercase">RUL</div>{selected.remainingUsefulLifeDays}d</div>
                <div><div className="text-[var(--muted)] font-mono text-[10px] uppercase">Vibration</div>{selected.vibrationTrendPct}%</div>
                <div><div className="text-[var(--muted)] font-mono text-[10px] uppercase">Temp</div>{selected.temperatureTrendPct}%</div>
              </div>
              <Link href={`/assets/${selected.id}`} className="block text-center mt-2 text-xs font-medium rounded-lg px-3 py-2" style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>
                Open full digital profile
              </Link>
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)]">Click any asset on the plant layout to see its live snapshot.</p>
          )}
        </div>
      </div>
    </>
  );
}
