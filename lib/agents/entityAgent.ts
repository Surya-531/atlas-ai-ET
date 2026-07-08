import { v4 as uuid } from "uuid";
import type { KnowledgeEntity } from "../types";
import { listAssets, listMaintenance } from "../store";

const REGULATION_PATTERNS = [
  /factory act[^.;\n]{0,40}/gi,
  /\bISO\s?\d{3,5}(?::\d{4})?\b/gi,
  /\bOSHA\s?\d{3,4}(?:\.\d+)?\b/gi,
  /\bOISD[^.;\n]{0,20}/gi,
];

const ASSET_CODE_PATTERN = /\b[A-Z]{1,3}-\d{2,4}\b/g;

export interface ExtractionResult {
  entities: KnowledgeEntity[];
  mentionedAssetCodes: string[];
}

/**
 * Rule + dictionary based entity extraction. It's a deterministic,
 * explainable stand-in for a trained industrial NER model — it recognizes
 * asset codes (P-203, C-102, M-110), known asset names, technicians already
 * in the maintenance log, department names, and regulation references
 * (Factory Act / ISO / OSHA / OISD). Swap for a fine-tuned NER pipeline in
 * production without changing the KnowledgeEntity contract.
 */
export function extractEntities(text: string): ExtractionResult {
  const entities: KnowledgeEntity[] = [];
  const mentionedAssetCodes = new Set<string>();

  const assets = listAssets();
  const technicians = new Set(listMaintenance().map((m) => m.technician));
  const departments = new Set(assets.map((a) => a.department));

  // Asset codes via regex
  for (const match of text.match(ASSET_CODE_PATTERN) ?? []) {
    const asset = assets.find((a) => a.code === match);
    if (asset) {
      mentionedAssetCodes.add(asset.code);
      entities.push({ id: uuid(), type: "asset", label: asset.name, refId: asset.id });
    }
  }

  // Asset names mentioned by name (e.g. "Compressor C-102" already caught by code,
  // but also catch bare type mentions like "the pump")
  for (const asset of assets) {
    if (text.toLowerCase().includes(asset.name.toLowerCase())) {
      mentionedAssetCodes.add(asset.code);
      entities.push({ id: uuid(), type: "asset", label: asset.name, refId: asset.id });
    }
  }

  // Technicians
  for (const tech of technicians) {
    if (tech && text.includes(tech)) {
      entities.push({ id: uuid(), type: "technician", label: tech });
    }
  }

  // Departments
  for (const dept of departments) {
    if (dept && text.toLowerCase().includes(dept.toLowerCase())) {
      entities.push({ id: uuid(), type: "department", label: dept });
    }
  }

  // Regulations
  for (const pattern of REGULATION_PATTERNS) {
    for (const match of text.match(pattern) ?? []) {
      entities.push({ id: uuid(), type: "regulation", label: match.trim() });
    }
  }

  // Parts / components — light dictionary
  const parts = ["bearing", "impeller", "seal", "gasket", "valve seat", "rotor", "coupling", "filter"];
  for (const part of parts) {
    if (text.toLowerCase().includes(part)) {
      entities.push({ id: uuid(), type: "part", label: part[0].toUpperCase() + part.slice(1) });
    }
  }

  return { entities, mentionedAssetCodes: [...mentionedAssetCodes] };
}
