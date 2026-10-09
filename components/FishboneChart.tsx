"use client";

import { useChartColors } from "@/components/charts/useChartColors";
import type { FishboneData } from "@/lib/lean/fishbone";
import { LAYOUT, layoutFishbone } from "@/lib/lean/fishboneLayout";

// Plain hex values on purpose: SVG attributes survive the PNG export.
export const CATEGORY_COLORS = [
  { line: "#0284c7", label: "#0369a1" }, // sky
  { line: "#059669", label: "#047857" }, // emerald
  { line: "#d97706", label: "#b45309" }, // amber
  { line: "#9333ea", label: "#7e22ce" }, // purple
  { line: "#e11d48", label: "#be123c" }, // rose
  { line: "#0d9488", label: "#0f766e" }, // teal
];

export default function FishboneChart({ data }: { data: FishboneData }) {
  const c = useChartColors();
  const layout = layoutFishbone(data);
  const { head } = layout;
  const lh = LAYOUT.lineHeight;
  const headCenterY = head.y + head.height / 2;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="w-full min-w-[720px]"
        role="img"
        aria-label={`Fishbone diagram for: ${data.problem || "no problem entered yet"}`}
      >
        {/* spine and head */}
        <line
          x1={LAYOUT.margin}
          x2={head.x}
          y1={layout.spineY}
          y2={layout.spineY}
          strokeWidth={4}
          stroke={c.inkMuted}
        />
        <rect
          x={head.x}
          y={head.y}
          width={head.width}
          height={head.height}
          rx={10}
          fill={c.ink}
        />
        {head.lines.map((line, i) => (
          <text
            key={i}
            x={head.x + head.width / 2}
            y={headCenterY + (i - (head.lines.length - 1) / 2) * LAYOUT.headLineHeight + 5}
            textAnchor="middle"
            fill={c.headText}
            className="text-[13px] font-semibold"
          >
            {line}
          </text>
        ))}

        {/* category bones */}
        {layout.bones.map((bone) => {
          const color = CATEGORY_COLORS[bone.index];

          return (
            <g key={bone.id}>
              <line
                x1={bone.x0}
                y1={bone.y0}
                x2={bone.x1}
                y2={bone.y1}
                strokeWidth={3}
                stroke={color.line}
              />
              <rect
                x={bone.x0 - 62}
                y={bone.labelY}
                width={124}
                height={28}
                rx={6}
                fill={color.label}
              />
              <text
                x={bone.x0}
                y={bone.labelY + 18}
                textAnchor="middle"
                fill="#ffffff"
                className="text-[12px] font-semibold"
              >
                {bone.name}
              </text>

              {bone.causes.map((cause) => {
                const textX = cause.x - 12;
                const firstLineY = cause.y - ((cause.lines.length - 1) * lh) / 2 + 4;

                return (
                  <g key={cause.text} className="animate-fade-in">
                    <line
                      x1={cause.x - 8}
                      y1={cause.y}
                      x2={cause.x}
                      y2={cause.y}
                      strokeWidth={1.5}
                      stroke={color.line}
                    />
                    <text y={firstLineY} textAnchor="end" fill={c.ink} className="text-[11px]">
                      {cause.lines.map((line, li) => (
                        <tspan key={li} x={textX} dy={li === 0 ? 0 : lh}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}