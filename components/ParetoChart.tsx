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
  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;
  const band = plotW / rows.length;
  const barW = band * 0.7;
  const y = (fraction: number) => M.top + plotH * (1 - fraction);

  const points = rows.map((r, i) => ({
    x: M.left + band * i + band / 2,
    y: y(r.cumulativePercent),
  }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Pareto chart: bars show counts per category, the line shows the cumulative percentage"
    >
      {/* grid and both axes (left: count, right: cumulative %) */}
      {TICKS.map((t) => (
        <g key={t}>
          <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className="stroke-foreground/10" />
          <text x={M.left - 6} y={y(t) + 4} textAnchor="end" className="fill-foreground/60 text-[11px]">
            {Math.round(total * t)}
          </text>
          <text x={W - M.right + 6} y={y(t) + 4} className="fill-foreground/60 text-[11px]">
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
        className="stroke-amber-500"
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
            className={r.vital ? "fill-sky-500" : "fill-foreground/25"}
          >
            <title>{`${r.label}: ${r.count}`}</title>
          </rect>
        );
      })}

      {/* cumulative line */}
      <path d={linePath} fill="none" strokeWidth={2} className="stroke-amber-500" />
      {points.map((p, i) => (
        <circle key={rows[i].label} cx={p.x} cy={p.y} r={3.5} className="fill-amber-500" />
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
            className="fill-foreground/70 text-[11px]"
          >
            {text}
          </text>
        );
      })}
    </svg>
  );
}