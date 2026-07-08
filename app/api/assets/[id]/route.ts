import { NextRequest, NextResponse } from "next/server";
import { getAsset, maintenanceForAsset, listIncidents, listDocuments } from "@/lib/store";
import { computeForecast, generateRecommendation } from "@/lib/agents/maintenanceAgent";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = getAsset(id);
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const maintenance = maintenanceForAsset(asset.code);
  const incidents = listIncidents().filter((i) => i.assetCode === asset.code);
  const documents = listDocuments()
    .filter((d) => d.linkedAssetCodes.includes(asset.code))
    .map((d) => ({ id: d.id, title: d.title, type: d.type, stage: d.stage }));
  const forecast = computeForecast(asset);
  const recommendation = await generateRecommendation(asset);

  return NextResponse.json({ asset, maintenance, incidents, documents, forecast, recommendation });
}
