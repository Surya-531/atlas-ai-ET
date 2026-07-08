"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ComplianceItem } from "@/lib/types";

export default function CompliancePage() {
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [score, setScore] = useState(100);

  useEffect(() => {
    fetch("/api/compliance").then((r) => r.json()).then((d) => {
      setItems(d.items);
      setScore(d.score);
    });
  }, []);

  return (
    <>
      <TopBar title="Compliance Center" description="Factory Act, ISO, OSHA, and OISD — tracked automatically against your documents." />
      <div className="p-6 max-w-7xl space-y-6">
        <div className="panel p-6 flex items-center gap-6">
          <div>
            <div className="text-[10px] font-mono uppercase text-[var(--muted)] mb-1">Audit Score</div>
            <div className="font-display text-4xl">{score}<span className="text-base text-[var(--muted)]">%</span></div>
          </div>
          <div className="flex-1 h-2 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${score}%`, background: score > 80 ? "var(--status-healthy)" : score > 50 ? "var(--status-warning)" : "var(--status-critical)" }}
            />
          </div>
        </div>

        <div className="panel p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-mono uppercase text-[var(--muted)] border-b border-[var(--border)]">
                <th className="py-2 pr-4">Regulation</th>
                <th className="py-2 pr-4">Requirement</th>
                <th className="py-2 pr-4">Asset</th>
                <th className="py-2 pr-4">Due</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border-soft)] last:border-0">
                  <td className="py-3 pr-4">{item.regulation}</td>
                  <td className="py-3 pr-4 text-[var(--muted)]">{item.requirement}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{item.assetCode ?? "—"}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{item.dueDate}</td>
                  <td className="py-3 pr-4"><StatusBadge status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
