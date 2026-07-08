import type { Asset } from "../types";
import { maintenanceForAsset } from "../store";
import { callLLM } from "../llm";

export interface ForecastPoint {
  day: number;
  healthScore: number;
}

/** Projects a simple degrading health curve from current risk + trends for the RUL chart. */
export function computeForecast(asset: Asset): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  const decayRate =
    (Math.max(asset.vibrationTrendPct, 0) + Math.max(asset.temperatureTrendPct, 0)) / 400 + 0.01;
  let health = 100 - asset.riskScore * 0.6;
  for (let day = 0; day <= 30; day += 3) {
    points.push({ day, healthScore: Math.max(0, Math.round(health * 10) / 10) });
    health -= decayRate * (100 - health + 10);
  }
  return points;
}

export function riskLabel(score: number): "healthy" | "warning" | "critical" {
  if (score >= 70) return "critical";
  if (score >= 40) return "warning";
  return "healthy";
}

/** Rule-based statistical risk model — deliberately transparent/explainable. */
export function recomputeRisk(asset: Asset): Pick<Asset, "riskScore" | "status" | "remainingUsefulLifeDays"> {
  const history = maintenanceForAsset(asset.code);
  const skipped = history.filter((h) => h.type === "skipped").length;
  const base =
    Math.max(asset.vibrationTrendPct, 0) * 1.4 +
    Math.max(asset.temperatureTrendPct, 0) * 1.1 +
    skipped * 12;
  const riskScore = Math.min(99, Math.round(base));
  const remainingUsefulLifeDays = Math.max(2, Math.round(120 - riskScore * 1.1));
  return { riskScore, status: riskLabel(riskScore), remainingUsefulLifeDays };
}

export async function generateRecommendation(asset: Asset): Promise<string> {
  const history = maintenanceForAsset(asset.code).slice(0, 5);
  const context = [
    `Asset: ${asset.name} (${asset.code}), type ${asset.type}, department ${asset.department}.`,
    `Risk score: ${asset.riskScore}/100 (${asset.status}). Remaining useful life: ~${asset.remainingUsefulLifeDays} days.`,
    `Vibration trend: ${asset.vibrationTrendPct}%. Temperature trend: ${asset.temperatureTrendPct}%.`,
    `Recent maintenance: ${history.map((h) => `${h.date} ${h.type} (${h.description})`).join("; ") || "none on record"}.`,
  ].join("\n");

  const answer = await callLLM([
    {
      role: "system",
      content:
        "You are the Maintenance Intelligence Agent for an industrial AI platform. Given asset telemetry and maintenance history, give ONE concise, specific, actionable maintenance recommendation (2-3 sentences) including timing.",
    },
    { role: "user", content: `CONTEXT:\n${context}\n\nTASK: Recommend the next maintenance action.` },
  ]);

  return answer;
}
