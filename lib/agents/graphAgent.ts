import { v4 as uuid } from "uuid";
import type { DocumentRecord, KnowledgeEntity } from "../types";
import { upsertEntity, upsertRelationship, listAssets } from "../store";

/**
 * Knowledge Graph Agent. Persists extracted entities as graph nodes and
 * links them to the source document plus, when the entity is an asset,
 * to that asset's department — building the "Factory → Department →
 * Machine → ... " graph described in the architecture doc incrementally,
 * one document at a time.
 */
export function updateGraphForDocument(doc: DocumentRecord, entities: KnowledgeEntity[]) {
  const docEntity = upsertEntity({ id: uuid(), type: "document", label: doc.title, refId: doc.id });
  const assets = listAssets();

  for (const raw of entities) {
    const persisted = upsertEntity(raw);
    upsertRelationship({
      id: uuid(),
      sourceId: docEntity.id,
      targetId: persisted.id,
      type: "mentions",
      weight: 0.5,
    });

    if (persisted.type === "asset" && persisted.refId) {
      const asset = assets.find((a) => a.id === persisted.refId);
      if (asset) {
        const deptEntity = upsertEntity({ id: uuid(), type: "department", label: asset.department });
        upsertRelationship({
          id: uuid(),
          sourceId: persisted.id,
          targetId: deptEntity.id,
          type: "belongs_to",
          weight: 1,
        });
      }
    }

    if (persisted.type === "technician") {
      // link technician to any asset entities also found in this document
      const assetEntities = entities.filter((e) => e.type === "asset");
      for (const ae of assetEntities) {
        const assetNode = upsertEntity(ae);
        upsertRelationship({
          id: uuid(),
          sourceId: persisted.id,
          targetId: assetNode.id,
          type: "maintained_by",
          weight: 0.75,
        });
      }
    }

    if (persisted.type === "regulation") {
      const assetEntities = entities.filter((e) => e.type === "asset");
      for (const ae of assetEntities) {
        const assetNode = upsertEntity(ae);
        upsertRelationship({
          id: uuid(),
          sourceId: persisted.id,
          targetId: assetNode.id,
          type: "governs",
          weight: 0.6,
        });
      }
    }
  }
}
