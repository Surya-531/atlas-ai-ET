"use client";

import type { Asset } from "@/lib/types";

const STATUS_COLOR: Record<string, string> = {
  healthy: "#34d399",
  warning: "#f5a524",
  critical: "#fb5b5b",
};

const ZONES = [
  { key: "Plant A", x: 40, width: 260, label: "Plant A" },
  { key: "Plant B", x: 320, width: 260, label: "Plant B" },
  { key: "Plant C", x: 600, width: 260, label: "Plant C" },
];

export function PlantTwin({ assets, onSelect, selectedId }: { assets: Asset[]; onSelect: (a: Asset) => void; selectedId?: string }) {
  const grouped = ZONES.map((zone) => ({
    zone,
    assets: assets.filter((a) => a.location.startsWith(zone.key)),
  }));

  return (
    <svg viewBox="0 0 900 380" className="w-full h-auto">
      <rect x="0" y="0" width="900" height="380" rx="14" fill="var(--surface)" stroke="var(--border)" />
      {/* grid texture */}
      {Array.from({ length: 18 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={380} stroke="#1c2740" strokeWidth={1} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 50} x2={900} y2={i * 50} stroke="#1c2740" strokeWidth={1} />
      ))}

      {grouped.map(({ zone, assets: zoneAssets }) => (
        <g key={zone.key}>
          <rect x={zone.x} y={30} width={zone.width} height={320} rx={10} fill="var(--surface-2)" stroke="var(--border)" strokeDasharray="4 3" />
          <text x={zone.x + 14} y={54} fill="var(--muted)" fontSize="12" fontFamily="var(--font-mono)" letterSpacing="1">
            {zone.label.toUpperCase()}
          </text>
          {zoneAssets.map((asset, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const cx = zone.x + 65 + col * 120;
            const cy = 110 + row * 90;
            const color = STATUS_COLOR[asset.status];
            const isSelected = selectedId === asset.id;
            return (
              <g
                key={asset.id}
                onClick={() => onSelect(asset)}
                style={{ cursor: "pointer" }}
                transform={`translate(${cx}, ${cy})`}
              >
                {asset.status === "critical" && (
                  <circle r={26} fill={color} opacity={0.15}>
                    <animate attributeName="r" values="22;30;22" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.25;0.05;0.25" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle r={20} fill="var(--surface)" stroke={color} strokeWidth={isSelected ? 3 : 2} />
                <circle r={5} fill={color} />
                <text y={38} textAnchor="middle" fill="var(--foreground)" fontSize="11" fontFamily="var(--font-mono)">
                  {asset.code}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
