import { v4 as uuid } from "uuid";
import type { DocumentRecord, DocumentType } from "../types";
import { addDocument, updateDocument, addChunks } from "../store";
import { extractText, chunkAndEmbed } from "./documentAgent";
import { extractEntities } from "./entityAgent";
import { updateGraphForDocument } from "./graphAgent";

export interface IngestionStep {
  stage: string;
  detail: string;
}

export interface IngestionResult {
  document: DocumentRecord;
  steps: IngestionStep[];
}

/**
 * Coordinator Agent — runs the full Document → OCR → Chunk → Embed →
 * Entities → Graph → Index pipeline described in the architecture doc.
 *
 * In a full production deployment this would be dispatched to a
 * Celery/Redis worker queue so uploads don't block the request; for the
 * hackathon prototype it runs inline so the UI can show each stage
 * completing in real time.
 */
export async function ingestDocument(
  filename: string,
  type: DocumentType,
  buffer: Buffer
): Promise<IngestionResult> {
  const steps: IngestionStep[] = [];
  const id = uuid();

  const rawText = await extractText(buffer, filename);
  steps.push({ stage: "ocr", detail: `Extracted ${rawText.length} characters of text` });

  let doc: DocumentRecord = {
    id,
    title: filename.replace(/\.[a-zA-Z0-9]+$/, ""),
    type,
    uploadedAt: new Date().toISOString(),
    sizeBytes: buffer.length,
    rawText,
    chunkIds: [],
    entityIds: [],
    stage: "ocr",
    linkedAssetCodes: [],
  };
  addDocument(doc);

  const chunks = await chunkAndEmbed(id, rawText);
  addChunks(chunks);
  doc = updateDocument(id, { chunkIds: chunks.map((c) => c.id), stage: "embedded" })!;
  steps.push({ stage: "chunk_embed", detail: `Created ${chunks.length} chunks and embeddings` });

  const { entities, mentionedAssetCodes } = extractEntities(rawText);
  doc = updateDocument(id, {
    entityIds: entities.map((e) => e.id),
    linkedAssetCodes: mentionedAssetCodes,
    stage: "entities_extracted",
  })!;
  steps.push({
    stage: "entities",
    detail: `Found ${entities.length} entities across ${mentionedAssetCodes.length} linked assets`,
  });

  updateGraphForDocument(doc, entities);
  doc = updateDocument(id, { stage: "graph_updated" })!;
  steps.push({ stage: "graph", detail: "Knowledge graph updated with new nodes and edges" });

  doc = updateDocument(id, { stage: "indexed" })!;
  steps.push({ stage: "indexed", detail: "Document is now searchable by the AI Copilot" });

  return { document: doc, steps };
}

/** Same pipeline as ingestDocument, but for raw text (paste box, or seed data) — skips OCR. */
export async function ingestRawText(
  title: string,
  type: DocumentType,
  rawText: string
): Promise<IngestionResult> {
  const steps: IngestionStep[] = [];
  const id = uuid();

  let doc: DocumentRecord = {
    id,
    title,
    type,
    uploadedAt: new Date().toISOString(),
    sizeBytes: Buffer.byteLength(rawText, "utf-8"),
    rawText,
    chunkIds: [],
    entityIds: [],
    stage: "uploaded",
    linkedAssetCodes: [],
  };
  addDocument(doc);

  const chunks = await chunkAndEmbed(id, rawText);
  addChunks(chunks);
  doc = updateDocument(id, { chunkIds: chunks.map((c) => c.id), stage: "embedded" })!;
  steps.push({ stage: "chunk_embed", detail: `Created ${chunks.length} chunks and embeddings` });

  const { entities, mentionedAssetCodes } = extractEntities(rawText);
  doc = updateDocument(id, {
    entityIds: entities.map((e) => e.id),
    linkedAssetCodes: mentionedAssetCodes,
    stage: "entities_extracted",
  })!;
  steps.push({ stage: "entities", detail: `Found ${entities.length} entities` });

  updateGraphForDocument(doc, entities);
  doc = updateDocument(id, { stage: "indexed" })!;
  steps.push({ stage: "graph", detail: "Knowledge graph updated; document indexed" });

  return { document: doc, steps };
}
