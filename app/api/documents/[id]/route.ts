import { NextRequest, NextResponse } from "next/server";
import { getDocument, chunksForDocument, listEntities } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = getDocument(id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const chunks = chunksForDocument(id).map((c) => ({ id: c.id, index: c.index, text: c.text }));
  const entities = listEntities().filter((e) => doc.entityIds.includes(e.id));
  return NextResponse.json({ document: doc, chunks, entities });
}
