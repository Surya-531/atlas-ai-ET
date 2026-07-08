import { v4 as uuid } from "uuid";
import type { RCAReport, Incident } from "../types";
import { getAsset, maintenanceForAsset, listIncidents, listDocuments, addRCAReport } from "../store";
import { callLLM } from "../llm";

export async function generateRCA(incident: Incident): Promise<RCAReport> {
  const asset = getAsset(incident.assetCode);
  const history = maintenanceForAsset(incident.assetCode);
  const skipped = history.filter((h) => h.type === "skipped");
  const priorIncidents = listIncidents().filter(
    (i) => i.assetCode === incident.assetCode && i.id !== incident.id
  );
  const relatedDocs = listDocuments().filter((d) => d.linkedAssetCodes.includes(incident.assetCode));

  const timeline = [
    ...history.slice(0, 6).map((h) => ({ date: h.date, event: `${h.type.toUpperCase()}: ${h.description}` })),
    { date: incident.date, event: `INCIDENT: ${incident.title}` },
  ].sort((a, b) => +new Date(a.date) - +new Date(b.date));

  const evidence: string[] = [];
  if (asset) {
    evidence.push(
      `Vibration trend of ${asset.vibrationTrendPct}% and temperature trend of ${asset.temperatureTrendPct}% recorded against baseline prior to the incident.`
    );
    evidence.push(`Risk score stood at ${asset.riskScore}/100 (${asset.status}) at time of analysis.`);
  }
  if (skipped.length) {
    evidence.push(
      `${skipped.length} scheduled maintenance action(s) were skipped: ${skipped.map((s) => s.date).join(", ")}.`
    );
  }
  if (priorIncidents.length) {
    evidence.push(
      `${priorIncidents.length} prior incident(s) on this asset with similar characteristics: ${priorIncidents
        .map((p) => p.title)
        .join("; ")}.`
    );
  }
  if (relatedDocs.length) {
    evidence.push(
      `${relatedDocs.length} related document(s) reference this asset: ${relatedDocs.map((d) => d.title).join(", ")}.`
    );
  }

  const contributingFactors: string[] = [];
  if (skipped.length) contributingFactors.push("Deferred / skipped preventive maintenance");
  if (asset && asset.vibrationTrendPct > 10) contributingFactors.push("Elevated vibration beyond OEM tolerance");
  if (asset && asset.temperatureTrendPct > 10) contributingFactors.push("Elevated operating temperature");
  if (priorIncidents.length) contributingFactors.push("Recurring failure pattern on this asset");
  if (!contributingFactors.length) contributingFactors.push("Insufficient historical data — recommend closer monitoring");

  const context = [
    `Incident: ${incident.title} on ${incident.assetCode} (${incident.date}), severity ${incident.severity}.`,
    `Description: ${incident.description}`,
    `Evidence: ${evidence.join(" ")}`,
    `Contributing factors identified: ${contributingFactors.join(", ")}.`,
  ].join("\n");

  const narrative = await callLLM([
    {
      role: "system",
      content:
        "You are the Root Cause Analysis Agent for an industrial AI platform. Given incident evidence, write: (1) a 2-sentence root cause statement, then on new lines prefixed 'CORRECTIVE:' one corrective action and 'PREVENTIVE:' one preventive action.",
    },
    { role: "user", content: `CONTEXT:\n${context}\n\nTASK: Produce the root cause statement and actions.` },
  ]);

  const rootCause = narrative.split(/CORRECTIVE:/i)[0].trim();
  const correctiveMatch = narrative.match(/CORRECTIVE:([\s\S]*?)(?:PREVENTIVE:|$)/i);
  const preventiveMatch = narrative.match(/PREVENTIVE:([\s\S]*)/i);

  const correctiveActions = [
    correctiveMatch?.[1]?.trim() || "Replace or repair the affected component before returning the asset to service.",
  ];
  const preventiveActions = [
    preventiveMatch?.[1]?.trim() ||
      "Add this failure mode to the preventive maintenance checklist and shorten the inspection interval for this asset class.",
  ];

  const confidence = Math.min(95, 40 + evidence.length * 12 + contributingFactors.length * 6);

  const report: RCAReport = {
    id: uuid(),
    incidentId: incident.id,
    generatedAt: new Date().toISOString(),
    timeline,
    evidence,
    contributingFactors,
    rootCause,
    correctiveActions,
    preventiveActions,
    confidence,
  };

  addRCAReport(report);
  return report;
}
