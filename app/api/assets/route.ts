import { NextResponse } from "next/server";
import { listAssets } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ assets: listAssets() });
}
