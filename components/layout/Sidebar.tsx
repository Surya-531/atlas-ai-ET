"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileStack,
  Share2,
  MessageSquareText,
  Cog,
  Siren,
  ShieldCheck,
  Factory,
  Waves,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Document Intelligence", icon: FileStack },
  { href: "/graph", label: "Knowledge Graph", icon: Share2 },
  { href: "/copilot", label: "AI Copilot", icon: MessageSquareText },
  { href: "/assets", label: "Asset Explorer", icon: Cog },
  { href: "/rca", label: "Root Cause Analysis", icon: Siren },
  { href: "/compliance", label: "Compliance Center", icon: ShieldCheck },
  { href: "/twin", label: "Digital Twin", icon: Factory },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)]/60 h-screen sticky top-0">
      <Link href="/dashboard" className="flex items-center gap-2 px-5 py-5">
        <Waves size={20} style={{ color: "var(--accent)" }} />
        <div>
          <div className="font-display text-base font-semibold leading-none">ATLAS AI</div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted)]">
            Industrial Brain
          </div>
        </div>
      </Link>
      <div className="scan-divider mx-5" />
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
              style={{
                background: active ? "var(--accent-soft)" : "transparent",
                color: active ? "var(--accent)" : "var(--muted)",
              }}
            >
              <Icon size={16} />
              <span className={active ? "text-[var(--foreground)]" : ""}>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 mx-3 mb-4 panel-2 text-xs text-[var(--muted)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-1.5 w-1.5 rounded-full pulse-dot" style={{ background: "var(--status-healthy)" }} />
          <span className="font-mono">Demo organization</span>
        </div>
        Riverside Manufacturing Co. · Plants A–C
      </div>
    </aside>
  );
}
