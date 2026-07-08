import { NextResponse } from "next/server";
import { listEntities, listRelationships } from "@/lib/store";

export async function GET() {
  const entities = listEntities();
  const relationships = listRelationships();
  return NextResponse.json({ entities, relationships });
}
