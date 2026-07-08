"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { MessageSquareText, Wrench, FileText, Siren } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Asset, MaintenanceRecord, Incident } from "@/lib/types";

interface AssetDetail {
  asset: Asset;
  maintenance: MaintenanceRecord[];
  incidents: Incident[];
  documents: { id: string; title: string; type: string; stage: string }[];
  forecast: { day: number; healthScore: number }[];
  recommendation: string;
}

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AssetDetail | null>(null);

  useEffect(() => {
    fetch(`/api/assets/${id}`).then((r) => r.json()).then(setData);
  }, [id]);

  if (!data) return <div className="p-6 text-sm text-[var(--muted)]">Loading digital profile…</div>;
  const { asset, maintenance, incidents, documents, forecast, recommendation } = data;

  return (
    <>
      <TopBar title={asset.name} description={`${asset.code} · ${asset.manufacturer} · installed ${asset.installedOn}`} />
      <div className="p-6 max-w-7xl space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="panel p-5">
            <div className="text-[10px] font-mono uppercase text-[var(--muted)] mb-1">Status</div>
            <StatusBadge status={asset.status} pulse={asset.status === "critical"} />
          </div>
          <div className="panel p-5">
            <div className="text-[10px] font-mono uppercase text-[var(--muted)] mb-1">Risk Score</div>
            <div className="font-display text-2xl">{asset.riskScore}<span className="text-sm text-[var(--muted)]">/100</span></div>
          </div>
          <div className="panel p-5">
            <div className="text-[10px] font-mono uppercase text-[var(--muted)] mb-1">Remaining Useful Life</div>
            <div className="font-display text-2xl">{asset.remainingUsefulLifeDays}<span className="text-sm text-[var(--muted)]"> days</span></div>
          </div>
          <div className="panel p-5">
            <div className="text-[10px] font-mono uppercase text-[var(--muted)] mb-1">Vibration / Temp trend</div>
            <div className="font-display text-2xl">{asset.vibrationTrendPct}% <span className="text-sm text-[var(--muted)]">/ {asset.temperatureTrendPct}%</span></div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="panel p-5 md:col-span-2">
            <h3 className="font-display text-sm font-medium mb-4">Predicted Health Forecast (30 days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2740" />
                <XAxis dataKey="day" tick={{ fill: "#5d6a85", fontSize: 11 }} tickFormatter={(d) => `d${d}`} />
                <YAxis tick={{ fill: "#5d6a85", fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#121b2e", border: "1px solid #26314a", fontSize: 12 }} />
                <Line type="monotone" dataKey="healthScore" stroke="#4cc9f0" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="panel p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wrench size={14} style={{ color: "var(--accent)" }} />
              <h3 className="font-display text-sm font-medium">AI Recommendation</h3>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">{recommendation}</p>
            <Link
              href={`/copilot?q=${encodeURIComponent(`Why is ${asset.name} at risk?`)}`}
              className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-2 w-fit"
              style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
            >
              <MessageSquareText size={13} /> Ask Copilot about this asset
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="panel p-5">
            <h3 className="font-display text-sm font-medium mb-4">Maintenance History</h3>
            <ul className="space-y-3">
              {maintenance.map((m) => (
                <li key={m.id} className="text-xs flex gap-3">
                  <span className="font-mono text-[var(--muted)] whitespace-nowrap">{m.date}</span>
                  <div>
                    <span
                      className="uppercase font-mono text-[10px] mr-2 px-1.5 py-0.5 rounded"
                      style={{
                        background: m.type === "skipped" ? "var(--status-critical-soft)" : "var(--status-healthy-soft)",
                        color: m.type === "skipped" ? "var(--status-critical)" : "var(--status-healthy)",
                      }}
                    >
                      {m.type}
                    </span>
                    {m.description} — <span className="text-[var(--muted)]">{m.technician}</span>
                  </div>
                </li>
              ))}
              {maintenance.length === 0 && <li className="text-xs text-[var(--muted)]">No maintenance recorded.</li>}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="panel p-5">
              <div className="flex items-center gap-2 mb-3">
                <Siren size={14} style={{ color: "var(--status-critical)" }} />
                <h3 className="font-display text-sm font-medium">Incidents</h3>
              </div>
              <ul className="space-y-2">
                {incidents.map((i) => (
                  <li key={i.id} className="text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[var(--muted)]">{i.date}</span>
                      <StatusBadge status={i.status} />
                    </div>
                    {i.title}
                  </li>
                ))}
                {incidents.length === 0 && <li className="text-xs text-[var(--muted)]">No incidents recorded.</li>}
              </ul>
            </div>

            <div className="panel p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} style={{ color: "var(--data)" }} />
                <h3 className="font-display text-sm font-medium">Related Documents</h3>
              </div>
              <ul className="space-y-2">
                {documents.map((d) => (
                  <li key={d.id} className="text-xs text-[var(--muted)]">{d.title}</li>
                ))}
                {documents.length === 0 && <li className="text-xs text-[var(--muted)]">No linked documents yet.</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
