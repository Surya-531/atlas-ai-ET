import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  accent = "var(--data)",
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  accent?: string;
  hint?: string;
}) {
  return (
    <div className="panel p-5 rise-in">
      <div className="flex items-start justify-between">
        <span className="text-xs uppercase tracking-wide font-mono text-[var(--muted)]">{label}</span>
        <Icon size={16} style={{ color: accent }} />
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-3xl font-medium">{value}</span>
        {unit && <span className="text-sm text-[var(--muted)]">{unit}</span>}
      </div>
      {hint && <div className="mt-2 text-xs text-[var(--muted)]">{hint}</div>}
    </div>
  );
}
