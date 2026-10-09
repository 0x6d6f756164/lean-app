"use client";

import { useChartColors } from "@/components/charts/useChartColors";
import type { ParetoRow } from "@/lib/lean/pareto";

interface ParetoChartProps {
  rows: ParetoRow[];
  total: number;
  threshold: number; // 0..1
}

const W = 640;
const H = 340;
const M = { top: 16, right: 48, bottom: 84, left: 48 };
const TICKS = [0, 0.2, 0.4, 0.6, 0.8, 1];

export default function ParetoChart({ rows, total, threshold }: ParetoChartProps) {
  const c = useChartColors();
  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;
  const band = plotW / rows.length;
  const barW = band * 0.7;
  const y = (fraction: number) => M.top + plotH * (1 - fraction);
  const cutoffLabel = `${Math.round(threshold * 100)}%`;

  const points = rows.map((r, i) => ({
    x: M.left + band * i + band / 2,
    y: y(r.cumulativePercent),
  }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Pareto chart: bars show counts per category, the line shows the cumulative percentage"
      >
        {/* grid and both axes (left: count, right: cumulative %) */}
        {TICKS.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke={c.grid} />
            <text
              x={M.left - 6}
              y={y(t) + 4}
              textAnchor="end"
              fill={c.inkMuted}
              className="text-[11px]"
            >
              {Math.round(total * t)}
            </text>
            <text x={W - M.right + 6} y={y(t) + 4} fill={c.inkMuted} className="text-[11px]">
              {Math.round(t * 100)}%
            </text>
          </g>
        ))}

        {/* cutoff line */}
        <line
          x1={M.left}
          x2={W - M.right}
          y1={y(threshold)}
          y2={y(threshold)}
          strokeDasharray="5 4"
          strokeWidth={1.5}
          stroke={c.inkMuted}
        />

        {/* bars */}
        {rows.map((r, i) => {
          const h = plotH * (r.count / total);
          return (
            <rect
              key={r.label}
              x={M.left + band * i + (band - barW) / 2}
              y={M.top + plotH - h}
              width={barW}
              height={h}
              rx={2}
              fill={r.vital ? c.accent : c.barMuted}
            >
              <title>{`${r.label}: ${r.count}`}</title>
            </rect>
          );
        })}

        {/* cumulative line */}
        <path d={linePath} fill="none" strokeWidth={2} stroke={c.warn} />
        {points.map((p, i) => (
          <circle key={rows[i].label} cx={p.x} cy={p.y} r={3.5} fill={c.warn} />
        ))}

        {/* category labels */}
        {rows.map((r, i) => {
          const x = M.left + band * i + band / 2;
          const labelY = M.top + plotH + 16;
          const text = r.label.length > 14 ? `${r.label.slice(0, 13)}…` : r.label;
          return (
            <text
              key={r.label}
              x={x}
              y={labelY}
              textAnchor="end"
              transform={`rotate(-35 ${x} ${labelY})`}
              fill={c.inkSoft}
              className="text-[11px]"
            >
              {text}
            </text>
          );
        })}
      </svg>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-foreground/70">
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: c.accent }}
          />
          Vital few (count, left axis)
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: c.barMuted }}
          />
          Other causes (count, left axis)
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="relative inline-block h-0.5 w-5"
            style={{ backgroundColor: c.warn }}
          >
            <span
              className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: c.warn }}
            />
          </span>
          Cumulative share (right axis)
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block w-5 border-t-2 border-dashed"
            style={{ borderColor: c.inkMuted }}
          />
          {cutoffLabel} cutoff
        </li>
      </ul>
    </div>
  );
}