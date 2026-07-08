import { listAssets, listIncidents, listCompliance, listDocuments } from "../store";
import { callLLM } from "../llm";
import { riskLabel } from "./maintenanceAgent";

export interface ExecutiveStats {
  assetHealthAvg: number;
  criticalAlerts: number;
  knowledgeCoveragePct: number;
  complianceScore: number;
  totalAssets: number;
  totalDocuments: number;
  openIncidents: number;
}

export function computeStats(): ExecutiveStats {
  const assets = listAssets();
  const docs = listDocuments();
  const compliance = listCompliance();
  const incidents = listIncidents();

  const assetHealthAvg = assets.length
    ? Math.round(assets.reduce((s, a) => s + (100 - a.riskScore), 0) / assets.length)
    : 100;
  const criticalAlerts = assets.filter((a) => riskLabel(a.riskScore) === "critical").length;
  const indexed = docs.filter((d) => d.stage === "indexed").length;
  const knowledgeCoveragePct = docs.length ? Math.round((indexed / docs.length) * 100) : 0;
  const compliant = compliance.filter((c) => c.status === "compliant").length;
  const complianceScore = compliance.length ? Math.round((compliant / compliance.length) * 100) : 100;
  const openIncidents = incidents.filter((i) => i.status !== "resolved").length;

  return {
    assetHealthAvg,
    criticalAlerts,
    knowledgeCoveragePct,
    complianceScore,
    totalAssets: assets.length,
    totalDocuments: docs.length,
    openIncidents,
  };
}

export async function generateExecutiveInsights(): Promise<string[]> {
  const stats = computeStats();
  const assets = listAssets();
  const worst = [...assets].sort((a, b) => b.riskScore - a.riskScore).slice(0, 3);

  const context = [
    `Average asset health: ${stats.assetHealthAvg}/100.`,
    `Critical alerts: ${stats.criticalAlerts}. Open incidents: ${stats.openIncidents}.`,
    `Compliance score: ${stats.complianceScore}%. Knowledge coverage: ${stats.knowledgeCoveragePct}%.`,
    `Highest risk assets: ${worst.map((a) => `${a.name} (${a.code}) risk ${a.riskScore}`).join("; ")}.`,
  ].join("\n");

  const narrative = await callLLM([
    {
      role: "system",
      content:
        "You are the Executive Summary Agent. Given operational stats, write exactly 3 short insight bullets (one line each, no numbering, no markdown) a plant manager would want to see first thing this morning. Be specific and reference asset codes.",
    },
    { role: "user", content: `CONTEXT:\n${context}\n\nTASK: Write the 3 insight bullets.` },
  ]);

  const bullets = narrative
    .split("\n")
    .map((l) => l.replace(/^[-•\d.]+\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 3);

  return bullets.length ? bullets : [context];
}
