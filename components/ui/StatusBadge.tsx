const STYLES: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
  healthy: { bg: "var(--status-healthy-soft)", fg: "var(--status-healthy)", dot: "var(--status-healthy)", label: "Healthy" },
  warning: { bg: "var(--status-warning-soft)", fg: "var(--status-warning)", dot: "var(--status-warning)", label: "Warning" },
  critical: { bg: "var(--status-critical-soft)", fg: "var(--status-critical)", dot: "var(--status-critical)", label: "Critical" },
  compliant: { bg: "var(--status-healthy-soft)", fg: "var(--status-healthy)", dot: "var(--status-healthy)", label: "Compliant" },
  expiring: { bg: "var(--status-warning-soft)", fg: "var(--status-warning)", dot: "var(--status-warning)", label: "Expiring" },
  missing: { bg: "var(--status-critical-soft)", fg: "var(--status-critical)", dot: "var(--status-critical)", label: "Missing" },
  expired: { bg: "var(--status-critical-soft)", fg: "var(--status-critical)", dot: "var(--status-critical)", label: "Expired" },
  open: { bg: "var(--status-critical-soft)", fg: "var(--status-critical)", dot: "var(--status-critical)", label: "Open" },
  investigating: { bg: "var(--status-warning-soft)", fg: "var(--status-warning)", dot: "var(--status-warning)", label: "Investigating" },
  resolved: { bg: "var(--status-healthy-soft)", fg: "var(--status-healthy)", dot: "var(--status-healthy)", label: "Resolved" },
};

export function StatusBadge({ status, pulse = false }: { status: string; pulse?: boolean }) {
  const s = STYLES[status] ?? STYLES.healthy;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium font-mono uppercase tracking-wide"
      style={{ background: s.bg, color: s.fg }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${pulse ? "pulse-dot" : ""}`}
        style={{ background: s.dot }}
      />
      {s.label}
    </span>
  );
}
