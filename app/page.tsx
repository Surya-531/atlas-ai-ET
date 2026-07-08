"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Waves, FileStack, Share2, MessageSquareText, Siren } from "lucide-react";

const EVIDENCE = [
  "Bearing vibration +23% vs. baseline",
  "Casing temperature +14% vs. baseline",
  "2 scheduled inspections skipped (Dec, Mar)",
  "Matching bearing failure — Plant B, 2022",
  "OEM manual: replace within 30 days at this threshold",
];

const PILLARS = [
  {
    icon: FileStack,
    title: "Document Intelligence",
    body: "OCR, chunking, and entity extraction turn OEM manuals, inspection reports, and incident logs into structured knowledge automatically.",
  },
  {
    icon: Share2,
    title: "Living Knowledge Graph",
    body: "Assets, technicians, regulations, and documents connect into one graph — so reasoning crosses department boundaries.",
  },
  {
    icon: MessageSquareText,
    title: "GraphRAG Copilot",
    body: "Every answer is grounded in retrieved evidence and graph traversal, with citations and a confidence score — never a guess.",
  },
  {
    icon: Siren,
    title: "Predictive & Root Cause",
    body: "Risk scoring, remaining-useful-life forecasts, and automated root cause analysis with corrective and preventive actions.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 md:px-10 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Waves size={20} style={{ color: "var(--accent)" }} />
          <span className="font-display font-semibold">ATLAS AI</span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium"
          style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
        >
          Enter platform <ArrowRight size={14} />
        </Link>
      </header>

      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-10 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block text-xs font-mono uppercase tracking-widest text-[var(--data)] mb-4">
            Industrial Knowledge Intelligence Platform
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-medium leading-[1.1] mb-5">
            The AI brain for
            <br />
            industrial operations.
          </h1>
          <p className="text-[var(--muted)] text-base md:text-lg max-w-md mb-8">
            ATLAS AI connects every document, machine, technician, and regulation into one
            reasoning engine — so it doesn&apos;t just retrieve information, it explains what to do next.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg px-5 py-3 text-sm font-medium"
              style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
            >
              Enter the platform <ArrowRight size={15} />
            </Link>
            <Link
              href="/copilot"
              className="flex items-center gap-1.5 rounded-lg px-5 py-3 text-sm font-medium hairline text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
            >
              Try the Copilot
            </Link>
          </div>
        </div>

        {/* Signature element: the reasoning trace */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="panel p-5 md:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wide text-[var(--muted)]">
              Copilot reasoning trace
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "var(--status-critical-soft)", color: "var(--status-critical)" }}>
              risk 82/100
            </span>
          </div>
          <p className="text-sm text-[var(--foreground)] mb-4">
            &ldquo;Can Compressor C-102 continue operating?&rdquo;
          </p>
          <div className="space-y-2 mb-4">
            {EVIDENCE.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.35 }}
                className="flex items-start gap-2 text-xs text-[var(--muted)] font-mono"
              >
                <span className="mt-1 h-1 w-1 rounded-full shrink-0" style={{ background: "var(--data)" }} />
                {item}
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + EVIDENCE.length * 0.15 + 0.2, duration: 0.4 }}
            className="panel-2 p-4"
          >
            <div className="text-xs font-mono text-[var(--muted)] mb-1">Answer</div>
            <div className="text-sm">
              Continue for <strong className="text-[var(--accent)]">17 days</strong>. Schedule bearing
              replacement in the Sunday 2AM maintenance window.{" "}
              <span className="text-[var(--data)]">96% confidence</span> · 5 sources cited.
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="scan-divider mb-16" />
        <h2 className="font-display text-2xl md:text-3xl font-medium mb-3 max-w-lg">
          It doesn&apos;t just answer questions — it reasons across your operation.
        </h2>
        <p className="text-[var(--muted)] max-w-lg mb-12">
          Four systems work together under one roof, instead of four disconnected tools.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="panel p-5">
              <Icon size={18} style={{ color: "var(--accent)" }} className="mb-3" />
              <h3 className="font-display text-sm font-medium mb-2">{title}</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 md:px-10 py-10 text-xs text-[var(--muted)] flex items-center justify-between">
        <span>ATLAS AI — hackathon prototype, demo mode by default.</span>
        <Link href="/dashboard" className="hover:text-[var(--foreground)]">
          Enter platform →
        </Link>
      </footer>
    </div>
  );
}
