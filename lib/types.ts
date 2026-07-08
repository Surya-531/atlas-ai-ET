// ATLAS AI — core domain types
// These mirror the SQL schema in /supabase/schema.sql so the local JSON
// repository and a future Supabase-backed repository stay interchangeable.

export type AssetStatus = "healthy" | "warning" | "critical";

export interface Asset {
  id: string;
  name: string;
  code: string; // e.g. P-203
  type: string; // Pump, Compressor, Motor, Valve, Boiler...
  department: string;
  location: string;
  installedOn: string;
  manufacturer: string;
  status: AssetStatus;
  riskScore: number; // 0-100, higher = worse
  remainingUsefulLifeDays: number;
  vibrationTrendPct: number; // % change vs baseline
  temperatureTrendPct: number; // % change vs baseline
  lastMaintenanceOn: string;
  notes?: string;
}

export type DocumentType =
  | "oem_manual"
  | "inspection_report"
  | "incident_report"
  | "maintenance_log"
  | "regulation"
  | "email"
  | "other";

export type IngestionStage =
  | "uploaded"
  | "ocr"
  | "chunked"
  | "embedded"
  | "entities_extracted"
  | "graph_updated"
  | "indexed";

export interface DocumentChunk {
  id: string;
  documentId: string;
  index: number;
  text: string;
  embedding: number[];
}

export interface DocumentRecord {
  id: string;
  title: string;
  type: DocumentType;
  uploadedAt: string;
  sizeBytes: number;
  rawText: string;
  chunkIds: string[];
  entityIds: string[];
  stage: IngestionStage;
  linkedAssetCodes: string[];
}

export type EntityType =
  | "asset"
  | "department"
  | "technician"
  | "regulation"
  | "incident"
  | "document"
  | "part";

export interface KnowledgeEntity {
  id: string;
  type: EntityType;
  label: string;
  refId?: string; // points back to asset/document/incident id if applicable
}

export type RelationshipType =
  | "mentions"
  | "belongs_to"
  | "maintained_by"
  | "caused"
  | "related_to"
  | "governs"
  | "part_of";

export interface KnowledgeRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  weight: number;
}

export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export interface Incident {
  id: string;
  assetCode: string;
  title: string;
  description: string;
  date: string;
  severity: IncidentSeverity;
  status: "open" | "investigating" | "resolved";
}

export interface MaintenanceRecord {
  id: string;
  assetCode: string;
  date: string;
  type: "scheduled" | "unscheduled" | "skipped" | "inspection";
  description: string;
  technician: string;
}

export type ComplianceStatus = "compliant" | "expiring" | "missing" | "expired";

export interface ComplianceItem {
  id: string;
  regulation: string; // e.g. "Factory Act 1948 - Sec 28", "ISO 55000", "OSHA 1910.147"
  requirement: string;
  assetCode?: string;
  status: ComplianceStatus;
  dueDate: string;
}

export interface Citation {
  documentId: string;
  documentTitle: string;
  chunkId: string;
  snippet: string;
  score: number;
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  citations?: Citation[];
  confidence?: number;
  reasoning?: string[];
  suggested?: string[];
}

export interface RCAReport {
  id: string;
  incidentId: string;
  generatedAt: string;
  timeline: { date: string; event: string }[];
  evidence: string[];
  contributingFactors: string[];
  rootCause: string;
  correctiveActions: string[];
  preventiveActions: string[];
  confidence: number;
}
