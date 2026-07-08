"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartPulse, Siren, BookOpenCheck, ShieldCheck, Sparkles } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Asset, Incident } from "@/lib/types";
import type { ExecutiveStats } from "@/lib/agents/executiveAgent";

interface DashboardData {
  stats: ExecutiveStats;
  insights: string[];
  criticalAssets: Asset[];
  recentIncidents: Incident[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  return (
    <>
      <TopBar
        title="Executive Dashboard"
        description="Live operational summary across every plant, asset, and document."
      />
      <div className="p-6 max-w-7xl space-y-6">
        {!data ? (
          <div className="text-sm text-[var(--muted)]">Loading operational picture…</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Asset Health" value={data.stats.assetHealthAvg} unit="/ 100" icon={HeartPulse} accent="var(--status-healthy)" />
              <StatCard label="Critical Alerts" value={data.stats.criticalAlerts} icon={Siren} accent="var(--status-critical)" />
              <StatCard label="Knowledge Coverage" value={data.stats.knowledgeCoveragePct} unit="%" icon={BookOpenCheck} accent="var(--data)" hint={`${data.stats.totalDocuments} documents indexed`} />
              <StatCard label="Compliance Score" value={data.stats.complianceScore} unit="%" icon={ShieldCheck} accent="var(--accent)" />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="panel p-5 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={15} style={{ color: "var(--accent)" }} />
                  <h2 className="font-display text-sm font-medium">Executive Insights</h2>
                </div>
                <ul className="space-y-3">
                  {data.insights.map((insight, i) => (
                    <li key={i} className="text-sm text-[var(--foreground)] flex gap-3">
                      <span className="font-mono text-xs text-[var(--muted)] mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="panel p-5">
                <h2 className="font-display text-sm font-medium mb-4">Recent Incidents</h2>
                <ul className="space-y-3">
                  {data.recentIncidents.map((incident) => (
                    <li key={incident.id} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[var(--muted)]">{incident.assetCode}</span>
                        <StatusBadge status={incident.status} />
                      </div>
                      <div className="text-[var(--foreground)]">{incident.title}</div>
                    </li>
                  ))}
                  {data.recentIncidents.length === 0 && (
                    <li className="text-xs text-[var(--muted)]">No incidents recorded.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="panel p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-sm font-medium">Assets Needing Attention</h2>
                <Link href="/assets" className="text-xs text-[var(--data)] hover:underline">
                  View all assets →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-mono uppercase text-[var(--muted)] border-b border-[var(--border)]">
                      <th className="py-2 pr-4">Asset</th>
                      <th className="py-2 pr-4">Department</th>
                      <th className="py-2 pr-4">Risk Score</th>
                      <th className="py-2 pr-4">RUL</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.criticalAssets.map((asset) => (
                      <tr key={asset.id} className="border-b border-[var(--border-soft)] last:border-0">
                        <td className="py-3 pr-4">
                          <Link href={`/assets/${asset.id}`} className="hover:text-[var(--data)]">
                            {asset.name} <span className="font-mono text-[var(--muted)]">({asset.code})</span>
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-[var(--muted)]">{asset.department}</td>
                        <td className="py-3 pr-4 font-mono">{asset.riskScore}/100</td>
                        <td className="py-3 pr-4 font-mono">{asset.remainingUsefulLifeDays}d</td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={asset.status} pulse={asset.status === "critical"} />
                        </td>
                      </tr>
                    ))}
                    {data.criticalAssets.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-[var(--muted)] text-xs">
                          No assets currently need attention.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
