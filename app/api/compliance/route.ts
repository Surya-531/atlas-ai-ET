import { NextResponse } from "next/server";
import { listCompliance } from "@/lib/store";

export async function GET() {
  const items = listCompliance();
  const score = items.length
    ? Math.round((items.filter((i) => i.status === "compliant").length / items.length) * 100)
    : 100;
  return NextResponse.json({ items, score });
}
