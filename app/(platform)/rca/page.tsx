"use client";

import { useEffect, useState } from "react";
import { Printer, Loader2, Siren } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Incident, RCAReport } from "@/lib/types";

export default function RCAPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [report, setReport] = useState<RCAReport | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/rca").then((r) => r.json()).then((d) => {
      setIncidents(d.incidents);
    });
  }, []);

  async function generate(incident: Incident) {
    setSelectedIncident(incident);
    setReport(null);
    setGenerating(true);
    const res = await fetch("/api/rca", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: incident.id }),
    });
    const data = await res.json();
    setReport(data.report);
    setGenerating(false);
  }

  return (
    <>
      <TopBar title="Root Cause Analysis" description="Select an incident — ATLAS assembles the timeline, evidence, and recommended actions." />
      <div className="p-6 max-w-7xl grid md:grid-cols-3 gap-4">
        <div className="panel p-5 md:col-span-1 h-fit">
          <h3 className="font-display text-sm font-medium mb-4">Incidents</h3>
          <ul className="space-y-2">
            {incidents.map((incident) => (
              <li key={incident.id}>
                <button
                  onClick={() => generate(incident)}
                  className="w-full text-left panel-2 p-3 hover:bg-[var(--surface-hover)] transition-colors"
                  style={selectedIncident?.id === incident.id ? { outline: "1px solid var(--accent)" } : undefined}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-[var(--muted)]">{incident.assetCode} · {incident.date}</span>
                    <StatusBadge status={incident.status} />
                  </div>
                  <div className="text-xs">{incident.title}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          {!selectedIncident && (
            <div className="panel p-10 text-center text-sm text-[var(--muted)] flex flex-col items-center gap-3">
              <Siren size={22} />
              Select an incident to generate its root cause analysis.
            </div>
          )}
          {generating && (
            <div className="panel p-10 text-center text-sm text-[var(--muted)] flex flex-col items-center gap-3">
              <Loader2 size={20} className="animate-spin" />
              Assembling timeline, evidence, and contributing factors…
            </div>
          )}
          {report && selectedIncident && !generating && (
            <div className="panel p-6 space-y-6" id="rca-report">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-medium">{selectedIncident.title}</h2>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Generated {new Date(report.generatedAt).toLocaleString()} · {report.confidence}% confidence
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs hairline rounded-lg px-3 py-2 hover:bg-[var(--surface-hover)] print:hidden"
                >
                  <Printer size={13} /> Export / Print
                </button>
              </div>

              <section>
                <h3 className="text-xs font-mono uppercase text-[var(--muted)] mb-3">Timeline</h3>
                <ul className="space-y-3 border-l border-[var(--border)] pl-4">
                  {report.timeline.map((t, i) => (
                    <li key={i} className="relative text-xs">
                      <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full" style={{ background: "var(--data)" }} />
                      <span className="font-mono text-[var(--muted)]">{t.date}</span> — {t.event}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-xs font-mono uppercase text-[var(--muted)] mb-3">Root Cause</h3>
                <p className="text-sm">{report.rootCause}</p>
              </section>

              <div className="grid md:grid-cols-2 gap-6">
                <section>
                  <h3 className="text-xs font-mono uppercase text-[var(--muted)] mb-3">Evidence</h3>
                  <ul className="space-y-2 text-xs text-[var(--muted)]">
                    {report.evidence.map((e, i) => <li key={i}>· {e}</li>)}
                  </ul>
                </section>
                <section>
                  <h3 className="text-xs font-mono uppercase text-[var(--muted)] mb-3">Contributing Factors</h3>
                  <ul className="space-y-2 text-xs text-[var(--muted)]">
                    {report.contributingFactors.map((f, i) => <li key={i}>· {f}</li>)}
                  </ul>
                </section>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <section>
                  <h3 className="text-xs font-mono uppercase text-[var(--status-critical)] mb-3">Corrective Actions</h3>
                  <ul className="space-y-2 text-xs">
                    {report.correctiveActions.map((a, i) => <li key={i}>· {a}</li>)}
                  </ul>
                </section>
                <section>
                  <h3 className="text-xs font-mono uppercase text-[var(--status-healthy)] mb-3">Preventive Actions</h3>
                  <ul className="space-y-2 text-xs">
                    {report.preventiveActions.map((a, i) => <li key={i}>· {a}</li>)}
                  </ul>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
