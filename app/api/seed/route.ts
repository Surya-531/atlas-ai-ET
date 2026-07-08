import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seedData";
import { listAssets } from "@/lib/store";

export async function POST() {
  await seedDatabase();
  return NextResponse.json({ ok: true, assets: listAssets().length });
}

export async function GET() {
  return NextResponse.json({ ok: true, seeded: listAssets().length > 0 });
}
