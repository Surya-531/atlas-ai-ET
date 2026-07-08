import { NextResponse } from "next/server";
import { computeStats, generateExecutiveInsights } from "@/lib/agents/executiveAgent";
import { listAssets, listIncidents } from "@/lib/store";
import { riskLabel } from "@/lib/agents/maintenanceAgent";

export async function GET() {
  const stats = computeStats();
  const insights = await generateExecutiveInsights();
  const assets = listAssets();
  const criticalAssets = assets
    .filter((a) => riskLabel(a.riskScore) !== "healthy")
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 6);
  const recentIncidents = listIncidents()
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5);

  return NextResponse.json({ stats, insights, criticalAssets, recentIncidents });
}
