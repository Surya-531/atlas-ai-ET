"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import type { DocumentRecord, DocumentType, KnowledgeEntity } from "@/lib/types";

const STAGES: { key: string; label: string }[] = [
  { key: "uploaded", label: "Uploaded" },
  { key: "ocr", label: "OCR" },
  { key: "embedded", label: "Chunk + Embed" },
  { key: "entities_extracted", label: "Entities" },
  { key: "graph_updated", label: "Graph" },
  { key: "indexed", label: "Indexed" },
];

function stageProgress(stage: string) {
  const idx = STAGES.findIndex((s) => s.key === stage);
  return idx === -1 ? 0 : ((idx + 1) / STAGES.length) * 100;
}

const TYPES: DocumentType[] = ["oem_manual", "inspection_report", "incident_report", "maintenance_log", "regulation", "email", "other"];

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteType, setPasteType] = useState<DocumentType>("other");
  const [pasteText, setPasteText] = useState("");
  const [selected, setSelected] = useState<{ document: DocumentRecord; chunks: { id: string; text: string }[]; entities: KnowledgeEntity[] } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => {
    fetch("/api/documents").then((r) => r.json()).then((d) => setDocs(d.documents));
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 4000);
    return () => clearInterval(interval);
  }, [refresh]);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      form.append("type", "other");
      await fetch("/api/documents", { method: "POST", body: form });
    }
    setUploading(false);
    refresh();
  }

  async function handlePasteSubmit() {
    if (!pasteTitle || !pasteText) return;
    setUploading(true);
    await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: pasteTitle, type: pasteType, text: pasteText }),
    });
    setUploading(false);
    setPasteOpen(false);
    setPasteTitle("");
    setPasteText("");
    refresh();
  }

  async function openDoc(id: string) {
    const res = await fetch(`/api/documents/${id}`);
    setSelected(await res.json());
  }

  return (
    <>
      <TopBar title="Document Intelligence" description="Upload OEM manuals, inspection reports, and logs — ATLAS ingests them automatically." />
      <div className="p-6 max-w-7xl space-y-6">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className="panel border-dashed p-10 flex flex-col items-center justify-center text-center gap-3"
          style={{ borderStyle: "dashed" }}
        >
          <UploadCloud size={26} style={{ color: "var(--data)" }} />
          <div className="text-sm">Drag and drop PDF, TXT, or MD files here</div>
          <div className="flex gap-3">
            <button
              onClick={() => fileInput.current?.click()}
              className="rounded-lg px-4 py-2 text-xs font-medium hairline hover:bg-[var(--surface-hover)]"
            >
              Browse files
            </button>
            <button
              onClick={() => setPasteOpen(true)}
              className="rounded-lg px-4 py-2 text-xs font-medium"
              style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
            >
              Paste text instead
            </button>
          </div>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept=".pdf,.txt,.md"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {uploading && (
            <div className="flex items-center gap-2 text-xs text-[var(--data)]">
              <Loader2 size={12} className="animate-spin" /> Running ingestion pipeline…
            </div>
          )}
        </div>

        {pasteOpen && (
          <div className="panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-medium">Paste document text</h3>
              <button onClick={() => setPasteOpen(false)}><X size={16} /></button>
            </div>
            <input
              value={pasteTitle}
              onChange={(e) => setPasteTitle(e.target.value)}
              placeholder="Document title (e.g. Pump P-203 Inspection Report — June 2026)"
              className="w-full rounded-lg bg-[var(--surface-2)] border border-[var(--border)] px-3 py-2 text-sm outline-none"
            />
            <select
              value={pasteType}
              onChange={(e) => setPasteType(e.target.value as DocumentType)}
              className="w-full rounded-lg bg-[var(--surface-2)] border border-[var(--border)] px-3 py-2 text-sm outline-none"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={6}
              placeholder="Paste the document content here…"
              className="w-full rounded-lg bg-[var(--surface-2)] border border-[var(--border)] px-3 py-2 text-sm outline-none resize-none"
            />
            <button
              onClick={handlePasteSubmit}
              disabled={uploading}
              className="rounded-lg px-4 py-2 text-xs font-medium"
              style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
            >
              {uploading ? "Ingesting…" : "Ingest document"}
            </button>
          </div>
        )}

        <div className="panel p-5">
          <h2 className="font-display text-sm font-medium mb-4">Document Library ({docs.length})</h2>
          <div className="space-y-3">
            {docs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => openDoc(doc.id)}
                className="w-full text-left panel-2 p-4 hover:bg-[var(--surface-hover)] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={14} style={{ color: "var(--data)" }} />
                    <span className="text-sm">{doc.title}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-[var(--muted)]">{doc.type.replace(/_/g, " ")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 rounded-full bg-[var(--border)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${stageProgress(doc.stage)}%`, background: "var(--accent)" }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--muted)] whitespace-nowrap">
                    {STAGES.find((s) => s.key === doc.stage)?.label ?? doc.stage}
                  </span>
                </div>
                {doc.linkedAssetCodes.length > 0 && (
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    {doc.linkedAssetCodes.map((code) => (
                      <span key={code} className="text-[10px] font-mono rounded px-1.5 py-0.5" style={{ background: "var(--data-soft)", color: "var(--data)" }}>
                        {code}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
            {docs.length === 0 && <div className="text-xs text-[var(--muted)]">No documents yet — upload one above.</div>}
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6" onClick={() => setSelected(null)}>
          <div className="panel max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-medium">{selected.document.title}</h3>
              <button onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className="mb-4 flex gap-2 flex-wrap">
              {selected.entities.map((e) => (
                <span key={e.id} className="text-[10px] font-mono rounded-full px-2 py-1" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                  {e.type}: {e.label}
                </span>
              ))}
            </div>
            <h4 className="text-xs font-mono uppercase text-[var(--muted)] mb-2">Chunks ({selected.chunks.length})</h4>
            <div className="space-y-2">
              {selected.chunks.map((c) => (
                <div key={c.id} className="panel-2 p-3 text-xs text-[var(--muted)]">{c.text}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
