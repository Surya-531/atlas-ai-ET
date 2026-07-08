import { NextRequest, NextResponse } from "next/server";
import { listIncidents, listRCAReports, getIncident } from "@/lib/store";
import { generateRCA } from "@/lib/agents/rcaAgent";

export async function GET() {
  return NextResponse.json({ incidents: listIncidents(), reports: listRCAReports() });
}

export async function POST(req: NextRequest) {
  const { incidentId } = await req.json();
  const incident = getIncident(incidentId);
  if (!incident) return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  const report = await generateRCA(incident);
  return NextResponse.json({ report });
}
