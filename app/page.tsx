"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Waves,
  FileStack,
  Share2,
  MessageSquareText,
  Siren,
  AlertTriangle,
  CheckCircle2,
  Network,
  Gauge,
  ShieldCheck,
  Factory,
  Database,
  BrainCircuit,
} from "lucide-react";

const EVIDENCE = [
  "Bearing vibration +23% vs. baseline",
  "Casing temperature +14% vs. baseline",
  "2 scheduled inspections skipped (Dec, Mar)",
  "Matching bearing failure - Plant B, 2022",
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
    body: "Assets, technicians, regulations, and documents connect into one graph - so reasoning crosses department boundaries.",
  },
  {
    icon: MessageSquareText,
    title: "GraphRAG Copilot",
    body: "Every answer is grounded in retrieved evidence and graph traversal, with citations and a confidence score - never a guess.",
  },
  {
    icon: Siren,
    title: "Predictive & Root Cause",
    body: "Risk scoring, remaining-useful-life forecasts, and automated root cause analysis with corrective and preventive actions.",
  },
];

const PROBLEM_POINTS = [
  "Critical knowledge is scattered across PDFs, spreadsheets, incident reports, manuals, and technician notes.",
  "Traditional dashboards show what is happening, but rarely explain why it is happening or what action should come next.",
  "Maintenance teams lose time connecting asset history, regulations, inspection findings, and prior failures by hand.",
  "Generic chatbots retrieve text, but they do not understand relationships between assets, people, documents, and events.",
];

const SOLUTION_STEPS = [
  {
    icon: FileStack,
    title: "Ingest",
    body: "Upload or paste manuals, inspections, incident reports, compliance notes, and maintenance records. ATLAS AI chunks, embeds, and prepares them for reasoning.",
  },
  {
    icon: Network,
    title: "Connect",
    body: "Extracted entities become graph nodes: assets, parts, technicians, regulations, locations, incidents, and documents are linked into one operational map.",
  },
  {
    icon: BrainCircuit,
    title: "Reason",
    body: "GraphRAG combines semantic retrieval with graph traversal, so answers include the evidence path, related history, confidence, and recommended action.",
  },
  {
    icon: Gauge,
    title: "Act",
    body: "Risk scores, remaining-useful-life forecasts, root cause reports, compliance gaps, and executive insights turn intelligence into decisions.",
  },
];

const WEBSITE_MODULES = [
  {
    route: "/dashboard",
    title: "Executive Dashboard",
    body: "A command view for KPIs, critical assets, AI-generated insights, and operational risk signals.",
  },
  {
    route: "/documents",
    title: "Document Intelligence",
    body: "Drag, drop, paste, and inspect the ingestion pipeline from raw industrial text to structured knowledge.",
  },
  {
    route: "/graph",
    title: "Knowledge Graph",
    body: "Explore how machines, failures, technicians, documents, and regulations connect across the plant.",
  },
  {
    route: "/copilot",
    title: "AI Copilot",
    body: "Ask operational questions and get grounded answers with citations, confidence, and a visible reasoning trace.",
  },
  {
    route: "/assets",
    title: "Asset Explorer",
    body: "Open digital profiles with status, maintenance timelines, health signals, and AI recommendations.",
  },
  {
    route: "/rca",
    title: "Root Cause Analysis",
    body: "Generate evidence-backed incident timelines, contributing factors, and corrective/preventive actions.",
  },
  {
    route: "/compliance",
    title: "Compliance Center",
    body: "Track audit readiness across Factory Act, ISO, OSHA, OISD, and other operational requirements.",
  },
  {
    route: "/twin",
    title: "Digital Twin",
    body: "View a simplified plant layout where asset health and risk are visible at a glance.",
  },
];

const IMPACT = [
  "Faster troubleshooting because evidence is already connected.",
  "Better maintenance planning through risk and RUL forecasting.",
  "Clearer compliance posture with traceable document references.",
  "Higher trust because every AI response shows sources and reasoning.",
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
            reasoning engine - so it doesn&apos;t just retrieve information, it explains what to do next.
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
            <span
              className="text-xs font-mono px-2 py-0.5 rounded-full"
              style={{ background: "var(--status-critical-soft)", color: "var(--status-critical)" }}
            >
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
              <span className="text-[var(--data)]">96% confidence</span> - 5 sources cited.
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="scan-divider mb-16" />
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--status-critical)] mb-4">
              <AlertTriangle size={14} />
              Project problem
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-medium mb-4 max-w-xl">
              Industrial teams are overloaded with information, but starved for connected context.
            </h2>
            <p className="text-[var(--muted)] max-w-xl leading-relaxed">
              A plant can have years of manuals, inspection notes, maintenance logs, sensor readings,
              compliance requirements, and incident reports. The hard part is not storing that data.
              The hard part is knowing which detail matters right now, how it relates to the current
              asset, and what decision it supports.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {PROBLEM_POINTS.map((point) => (
              <div key={point} className="panel p-5">
                <div className="h-1 w-8 rounded-full mb-4" style={{ background: "var(--status-critical)" }} />
                <p className="text-sm text-[var(--muted)] leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-start">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--status-healthy)] mb-4">
              <CheckCircle2 size={14} />
              Project solution
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-medium mb-4 max-w-xl">
              ATLAS AI turns disconnected operational data into a reasoning layer for the whole plant.
            </h2>
            <p className="text-[var(--muted)] max-w-xl leading-relaxed">
              The platform combines document intelligence, entity extraction, a living knowledge graph,
              GraphRAG retrieval, predictive maintenance, and root cause analysis. It is designed to
              answer practical questions such as why an asset is risky, which evidence supports that
              conclusion, and what action should be taken before downtime occurs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {SOLUTION_STEPS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="panel p-5">
                <Icon size={18} style={{ color: "var(--accent)" }} className="mb-4" />
                <h3 className="font-display text-base font-medium mb-2">{title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="scan-divider mb-16" />
        <h2 className="font-display text-2xl md:text-3xl font-medium mb-3 max-w-lg">
          It doesn&apos;t just answer questions - it reasons across your operation.
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

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="scan-divider mb-16" />
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--data)] mb-4">
              <Factory size={14} />
              Website overview
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-medium max-w-xl">
              The website is a full demo platform, not only a landing page.
            </h2>
          </div>
          <p className="text-[var(--muted)] max-w-md leading-relaxed">
            Each route demonstrates a different part of the industrial AI workflow, from document
            ingestion to executive decision support.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {WEBSITE_MODULES.map(({ route, title, body }) => (
            <Link key={route} href={route} className="panel p-5 hover:bg-[var(--surface-hover)] transition-colors">
              <div className="text-xs font-mono text-[var(--data)] mb-3">{route}</div>
              <h3 className="font-display text-sm font-medium mb-2">{title}</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="panel p-6">
            <Database size={18} style={{ color: "var(--accent)" }} className="mb-4" />
            <h2 className="font-display text-2xl font-medium mb-3">Built for a working demo.</h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              ATLAS AI runs with a local JSON data layer, offline embeddings, seeded demo assets,
              and an optional OpenRouter model key. That makes it easy to present immediately while
              keeping a clear path to Supabase, Qdrant, Neo4j, OCR services, and worker queues.
            </p>
          </div>
          <div className="panel p-6">
            <ShieldCheck size={18} style={{ color: "var(--status-healthy)" }} className="mb-4" />
            <h2 className="font-display text-2xl font-medium mb-3">Designed for trust.</h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              The platform emphasizes cited evidence, traceable reasoning, confidence scores, and
              graph context so users can inspect why an answer was produced before acting on it.
            </p>
          </div>
          <div className="panel p-6">
            <Gauge size={18} style={{ color: "var(--data)" }} className="mb-4" />
            <h2 className="font-display text-2xl font-medium mb-3">Expected impact.</h2>
            <div className="space-y-3">
              {IMPACT.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--data)" }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 md:px-10 py-10 text-xs text-[var(--muted)] flex items-center justify-between">
        <span>ATLAS AI - hackathon prototype, demo mode by default.</span>
        <Link href="/dashboard" className="hover:text-[var(--foreground)]">
          Enter platform -&gt;
        </Link>
      </footer>
    </div>
  );
}
