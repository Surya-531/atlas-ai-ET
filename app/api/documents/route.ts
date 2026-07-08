import { NextRequest, NextResponse } from "next/server";
import { listDocuments } from "@/lib/store";
import { ingestDocument, ingestRawText } from "@/lib/agents/coordinator";
import type { DocumentType } from "@/lib/types";

export async function GET() {
  const docs = listDocuments()
    .sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))
    .map((d) => ({ ...d, rawText: d.rawText.slice(0, 0) })); // don't ship full text in list view
  return NextResponse.json({ documents: docs });
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const type = (form.get("type") as DocumentType) || "other";
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await ingestDocument(file.name, type, buffer);
    return NextResponse.json(result);
  }

  const body = await req.json();
  const { title, type, text } = body as { title: string; type: DocumentType; text: string };
  if (!text || !title) return NextResponse.json({ error: "title and text are required" }, { status: 400 });
  const result = await ingestRawText(title, type || "other", text);
  return NextResponse.json(result);
}
