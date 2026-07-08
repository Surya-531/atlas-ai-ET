import { v4 as uuid } from "uuid";
import type { DocumentChunk } from "../types";
import { embed } from "../embeddings";

/**
 * Extracts plain text from an uploaded file buffer.
 * PDFs are parsed with pdf-parse (real text extraction — the closest
 * offline equivalent to the Docling/PyMuPDF pipeline described in the
 * architecture doc). Plain text / markdown files are decoded directly.
 * Anything else (scanned images) would route to an OCR provider — see the
 * OCR_API_URL hook below.
 */
export async function extractText(buffer: Buffer, filename: string): Promise<string> {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) {
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const result = await pdfParse(buffer);
      return result.text;
    } catch {
      return "";
    }
  }
  if (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".tif") ||
    lower.endsWith(".tiff")
  ) {
    return await ocrImage(buffer);
  }
  return buffer.toString("utf-8");
}

/**
 * OCR hook. Set OCR_API_URL + OCR_API_KEY to a hosted PaddleOCR / Docling
 * service to enable real scanned-document ingestion. Without it, image
 * uploads are stored with a placeholder so the pipeline doesn't break.
 */
async function ocrImage(buffer: Buffer): Promise<string> {
  const url = process.env.OCR_API_URL;
  const key = process.env.OCR_API_KEY;
  if (!url || !key) {
    return "[Scanned image uploaded. Configure OCR_API_URL / OCR_API_KEY to enable text extraction from images.]";
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/octet-stream" },
      body: new Uint8Array(buffer),
    });
    const json = await res.json();
    return json?.text ?? "";
  } catch {
    return "";
  }
}

/** Splits text into overlapping ~350-character chunks on sentence boundaries. */
export function splitIntoChunks(text: string, targetSize = 350, overlap = 60): string[] {
  const clean = text.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  if (!clean) return [];

  const sentences = clean.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).length > targetSize && current.length > 0) {
      chunks.push(current.trim());
      const words = current.split(" ");
      current = words.slice(Math.max(0, words.length - overlap / 6)).join(" ") + " " + sentence;
    } else {
      current += (current ? " " : "") + sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter((c) => c.length > 10);
}

export async function chunkAndEmbed(documentId: string, text: string): Promise<DocumentChunk[]> {
  const pieces = splitIntoChunks(text);
  const chunks: DocumentChunk[] = [];
  for (let i = 0; i < pieces.length; i++) {
    const embedding = await embed(pieces[i]);
    chunks.push({
      id: uuid(),
      documentId,
      index: i,
      text: pieces[i],
      embedding,
    });
  }
  return chunks;
}
