import type { OeeSeries } from "@/lib/dashboard/aggregate";

// Plain hex values on purpose, like the fishbone: they survive image capture.
export const SERIES_COLORS = ["#0284c7", "#059669", "#d97706", "#9333ea", "#e11d48", "#0d9488"];

const W = 640;
const H = 300;
const M = { top: 16, right: 20, bottom: 34, left: 44 };
const TICKS = [0, 0.2, 0.4, 0.6, 0.8, 1];
const WORLD_CLASS = 0.85;
const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

export default function OeeTrendChart({ series }: { series: OeeSeries[] }) {
  const all = series.flatMap((s) => s.points);
  if (all.length === 0) return null;

  const minT = Math.min(...all.map((p) => p.time));
  const maxT = Math.max(...all.map((p) => p.time));
  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;

  const x = (t: number) =>
    M.left + (maxT === minT ? plotW / 2 : ((t - minT) / (maxT - minT)) * plotW);
  const y = (v: number) => M.top + plotH * (1 - v);
  const xTicks =
    maxT === minT ? [minT] : [0, 0.25, 0.5, 0.75, 1].map((f) => minT + (maxT - minT) * f);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Line chart of OEE over time, one line per area"
    >
      {TICKS.map((t) => (
        <g key={t}>
          <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className="stroke-foreground/10" />
          <text x={M.left - 6} y={y(t) + 4} textAnchor="end" className="fill-foreground/60 text-[11px]">
            {Math.round(t * 100)}%
          </text>
        </g>
      ))}

      <line
        x1={M.left}
        x2={W - M.right}
        y1={y(WORLD_CLASS)}
        y2={y(WORLD_CLASS)}
        strokeDasharray="5 4"
        className="stroke-foreground/40"
      />
      <text
        x={W - M.right}
        y={y(WORLD_CLASS) - 5}
        textAnchor="end"
        className="fill-foreground/60 text-[11px]"
      >
        85% world class
      </text>

      {xTicks.map((t) => (
        <text
          key={t}
          x={x(t)}
          y={H - 10}
          textAnchor="middle"
          className="fill-foreground/60 text-[11px]"
        >
          {dayFormat.format(new Date(t))}
        </text>
      ))}

      {series.map((s, i) => {
        const color = SERIES_COLORS[i % SERIES_COLORS.length];
        const path = s.points
          .map((p, k) => `${k === 0 ? "M" : "L"}${x(p.time)},${y(p.oee)}`)
          .join(" ");

        return (
          <g key={s.key}>
            {s.points.length > 1 && <path d={path} fill="none" stroke={color} strokeWidth={2} />}
            {s.points.map((p, k) => (
              <circle key={k} cx={x(p.time)} cy={y(p.oee)} r={3.5} fill={color}>
                <title>{`${s.area}: ${(p.oee * 100).toFixed(1)}% on ${dayFormat.format(new Date(p.time))}`}</title>
              </circle>
            ))}
          </g>
        );
      })}
    </svg>
  );
}