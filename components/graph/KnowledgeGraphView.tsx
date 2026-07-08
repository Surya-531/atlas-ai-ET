"use client";

import { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import type { KnowledgeEntity, KnowledgeRelationship, EntityType } from "@/lib/types";

const TYPE_COLOR: Record<EntityType, string> = {
  asset: "#4cc9f0",
  document: "#8b96ac",
  technician: "#34d399",
  regulation: "#f5a524",
  incident: "#fb5b5b",
  department: "#c084fc",
  part: "#fb7185",
};

const COLUMN_ORDER: EntityType[] = ["document", "department", "asset", "technician", "regulation", "part", "incident"];

export function KnowledgeGraphView({
  entities,
  relationships,
  onSelect,
}: {
  entities: KnowledgeEntity[];
  relationships: KnowledgeRelationship[];
  onSelect: (entity: KnowledgeEntity | null) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const columnCounts: Record<string, number> = {};
    const nodes: Node[] = entities.map((e) => {
      const col = COLUMN_ORDER.indexOf(e.type);
      const row = columnCounts[e.type] ?? 0;
      columnCounts[e.type] = row + 1;
      const isActive = activeId === e.id;
      const isDimmed = activeId !== null && !isActive && !relationships.some(
        (r) => (r.sourceId === activeId && r.targetId === e.id) || (r.targetId === activeId && r.sourceId === e.id)
      );

      return {
        id: e.id,
        position: { x: (col === -1 ? 7 : col) * 240, y: row * 78 },
        data: { label: e.label, type: e.type },
        style: {
          background: isActive ? TYPE_COLOR[e.type] : "#121b2e",
          color: isActive ? "#0b1220" : "#e8ecf4",
          border: `1.5px solid ${TYPE_COLOR[e.type]}`,
          borderRadius: 8,
          fontSize: 11,
          padding: "6px 10px",
          width: 200,
          opacity: isDimmed ? 0.25 : 1,
          fontFamily: "var(--font-mono)",
        },
      };
    });

    const edges: Edge[] = relationships.map((r) => {
      const touches = activeId && (r.sourceId === activeId || r.targetId === activeId);
      return {
        id: r.id,
        source: r.sourceId,
        target: r.targetId,
        label: r.type,
        animated: !!touches,
        style: { stroke: touches ? "var(--data)" : "#26314a", opacity: activeId && !touches ? 0.15 : 0.7 },
        labelStyle: { fill: "#5d6a85", fontSize: 9 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#26314a", width: 14, height: 14 },
      };
    });

    return { nodes, edges };
  }, [entities, relationships, activeId]);

  return (
    <div style={{ height: "70vh" }} className="panel overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => {
          const entity = entities.find((e) => e.id === node.id) ?? null;
          setActiveId(entity?.id ?? null);
          onSelect(entity);
        }}
        onPaneClick={() => {
          setActiveId(null);
          onSelect(null);
        }}
      >
        <Background color="#1c2740" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
