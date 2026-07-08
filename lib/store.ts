import { readCollection, writeCollection, resetCollection } from "./db/jsonStore";
import type {
  Asset,
  DocumentRecord,
  DocumentChunk,
  KnowledgeEntity,
  KnowledgeRelationship,
  Incident,
  MaintenanceRecord,
  ComplianceItem,
  CopilotMessage,
  RCAReport,
} from "./types";

// ---------- Assets ----------
export function listAssets(): Asset[] {
  return readCollection<Asset>("assets");
}
export function getAsset(codeOrId: string): Asset | undefined {
  return listAssets().find((a) => a.code === codeOrId || a.id === codeOrId);
}
export function saveAssets(assets: Asset[]) {
  writeCollection("assets", assets);
}
export function updateAsset(id: string, patch: Partial<Asset>) {
  const assets = listAssets().map((a) => (a.id === id ? { ...a, ...patch } : a));
  saveAssets(assets);
  return assets.find((a) => a.id === id);
}

// ---------- Documents ----------
export function listDocuments(): DocumentRecord[] {
  return readCollection<DocumentRecord>("documents");
}
export function getDocument(id: string): DocumentRecord | undefined {
  return listDocuments().find((d) => d.id === id);
}
export function saveDocuments(docs: DocumentRecord[]) {
  writeCollection("documents", docs);
}
export function addDocument(doc: DocumentRecord) {
  const docs = listDocuments();
  docs.unshift(doc);
  saveDocuments(docs);
  return doc;
}
export function updateDocument(id: string, patch: Partial<DocumentRecord>) {
  const docs = listDocuments().map((d) => (d.id === id ? { ...d, ...patch } : d));
  saveDocuments(docs);
  return docs.find((d) => d.id === id);
}

// ---------- Chunks ----------
export function listChunks(): DocumentChunk[] {
  return readCollection<DocumentChunk>("chunks");
}
export function saveChunks(chunks: DocumentChunk[]) {
  writeCollection("chunks", chunks);
}
export function addChunks(newChunks: DocumentChunk[]) {
  const chunks = listChunks();
  chunks.push(...newChunks);
  saveChunks(chunks);
}
export function chunksForDocument(documentId: string): DocumentChunk[] {
  return listChunks().filter((c) => c.documentId === documentId);
}

// ---------- Knowledge graph ----------
export function listEntities(): KnowledgeEntity[] {
  return readCollection<KnowledgeEntity>("entities");
}
export function saveEntities(entities: KnowledgeEntity[]) {
  writeCollection("entities", entities);
}
export function upsertEntity(entity: KnowledgeEntity): KnowledgeEntity {
  const entities = listEntities();
  const existing = entities.find(
    (e) => e.type === entity.type && e.label.toLowerCase() === entity.label.toLowerCase()
  );
  if (existing) return existing;
  entities.push(entity);
  saveEntities(entities);
  return entity;
}

export function listRelationships(): KnowledgeRelationship[] {
  return readCollection<KnowledgeRelationship>("relationships");
}
export function saveRelationships(rels: KnowledgeRelationship[]) {
  writeCollection("relationships", rels);
}
export function upsertRelationship(rel: KnowledgeRelationship) {
  const rels = listRelationships();
  const existing = rels.find(
    (r) => r.sourceId === rel.sourceId && r.targetId === rel.targetId && r.type === rel.type
  );
  if (existing) {
    existing.weight = Math.min(1, existing.weight + rel.weight * 0.25);
    saveRelationships(rels);
    return existing;
  }
  rels.push(rel);
  saveRelationships(rels);
  return rel;
}

// ---------- Incidents ----------
export function listIncidents(): Incident[] {
  return readCollection<Incident>("incidents");
}
export function saveIncidents(incidents: Incident[]) {
  writeCollection("incidents", incidents);
}
export function getIncident(id: string): Incident | undefined {
  return listIncidents().find((i) => i.id === id);
}

// ---------- Maintenance ----------
export function listMaintenance(): MaintenanceRecord[] {
  return readCollection<MaintenanceRecord>("maintenance");
}
export function saveMaintenance(records: MaintenanceRecord[]) {
  writeCollection("maintenance", records);
}
export function maintenanceForAsset(assetCode: string): MaintenanceRecord[] {
  return listMaintenance()
    .filter((m) => m.assetCode === assetCode)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

// ---------- Compliance ----------
export function listCompliance(): ComplianceItem[] {
  return readCollection<ComplianceItem>("compliance");
}
export function saveCompliance(items: ComplianceItem[]) {
  writeCollection("compliance", items);
}

// ---------- Copilot conversations ----------
export function listMessages(): CopilotMessage[] {
  return readCollection<CopilotMessage>("messages");
}
export function saveMessages(messages: CopilotMessage[]) {
  writeCollection("messages", messages);
}
export function addMessage(message: CopilotMessage) {
  const messages = listMessages();
  messages.push(message);
  saveMessages(messages);
  return message;
}

// ---------- RCA reports ----------
export function listRCAReports(): RCAReport[] {
  return readCollection<RCAReport>("rca_reports");
}
export function saveRCAReports(reports: RCAReport[]) {
  writeCollection("rca_reports", reports);
}
export function addRCAReport(report: RCAReport) {
  const reports = listRCAReports();
  reports.unshift(report);
  saveRCAReports(reports);
  return report;
}

// ---------- Reset / reseed ----------
export function resetAll() {
  [
    "assets",
    "documents",
    "chunks",
    "entities",
    "relationships",
    "incidents",
    "maintenance",
    "compliance",
    "messages",
    "rca_reports",
  ].forEach(resetCollection);
}
