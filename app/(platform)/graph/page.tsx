"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { KnowledgeGraphView } from "@/components/graph/KnowledgeGraphView";
import type { KnowledgeEntity, KnowledgeRelationship } from "@/lib/types";

const LEGEND: { type: string; color: string }[] = [
  { type: "document", color: "#8b96ac" },
  { type: "asset", color: "#4cc9f0" },
  { type: "department", color: "#c084fc" },
  { type: "technician", color: "#34d399" },
  { type: "regulation", color: "#f5a524" },
  { type: "part", color: "#fb7185" },
];

export default function GraphPage() {
  const [entities, setEntities] = useState<KnowledgeEntity[]>([]);
  const [relationships, setRelationships] = useState<KnowledgeRelationship[]>([]);
  const [selected, setSelected] = useState<KnowledgeEntity | null>(null);

  useEffect(() => {
    fetch("/api/graph")
      .then((r) => r.json())
      .then((d) => {
        setEntities(d.entities);
        setRelationships(d.relationships);
      });
  }, []);

  const connections = selected
    ? relationships.filter((r) => r.sourceId === selected.id || r.targetId === selected.id)
    : [];

  return (
    <>
      <TopBar title="Knowledge Graph" description="Every document, asset, technician, and regulation — connected." />
      <div className="p-6 max-w-7xl space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          {LEGEND.map((l) => (
            <div key={l.type} className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
              <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
              {l.type}
            </div>
          ))}
          <span className="text-xs text-[var(--muted)] ml-auto">
            {entities.length} nodes · {relationships.length} relationships
          </span>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <KnowledgeGraphView entities={entities} relationships={relationships} onSelect={setSelected} />
          </div>
          <div className="panel p-4">
            <h3 className="font-display text-sm font-medium mb-3">Node detail</h3>
            {selected ? (
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-mono uppercase text-[var(--muted)]">{selected.type}</div>
                  <div className="text-sm">{selected.label}</div>
                </div>
                <div className="scan-divider" />
                <div className="text-[10px] font-mono uppercase text-[var(--muted)] mb-1">
                  Connections ({connections.length})
                </div>
                <ul className="space-y-1.5 text-xs text-[var(--muted)]">
                  {connections.map((c) => {
                    const otherId = c.sourceId === selected.id ? c.targetId : c.sourceId;
                    const other = entities.find((e) => e.id === otherId);
                    return (
                      <li key={c.id}>
                        <span className="text-[var(--data)]">{c.type}</span> → {other?.label ?? "?"}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)]">Click a node to inspect its connections.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
