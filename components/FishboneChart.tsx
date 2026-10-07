import type { FishboneData } from "@/lib/lean/fishbone";
import { LAYOUT, layoutFishbone } from "@/lib/lean/fishboneLayout";

// Full class names are listed so Tailwind can detect them.
export const CATEGORY_COLORS = [
  { stroke: "stroke-sky-500", fill: "fill-sky-500", bg: "bg-sky-500" },
  { stroke: "stroke-emerald-500", fill: "fill-emerald-500", bg: "bg-emerald-500" },
  { stroke: "stroke-amber-500", fill: "fill-amber-500", bg: "bg-amber-500" },
  { stroke: "stroke-purple-500", fill: "fill-purple-500", bg: "bg-purple-500" },
  { stroke: "stroke-rose-500", fill: "fill-rose-500", bg: "bg-rose-500" },
  { stroke: "stroke-teal-500", fill: "fill-teal-500", bg: "bg-teal-500" },
];

export default function FishboneChart({ data }: { data: FishboneData }) {
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
          className="stroke-foreground/60"
        />
        <rect
          x={head.x}
          y={head.y}
          width={head.width}
          height={head.height}
          rx={10}
          className="fill-foreground"
        />
        {head.lines.map((line, i) => (
          <text
            key={i}
            x={head.x + head.width / 2}
            y={headCenterY + (i - (head.lines.length - 1) / 2) * LAYOUT.headLineHeight + 5}
            textAnchor="middle"
            className="fill-background text-[13px] font-semibold"
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
                className={color.stroke}
              />
              <rect
                x={bone.x0 - 62}
                y={bone.labelY}
                width={124}
                height={28}
                rx={6}
                className={color.fill}
              />
              <text
                x={bone.x0}
                y={bone.labelY + 18}
                textAnchor="middle"
                className="fill-white text-[12px] font-semibold"
              >
                {bone.name}
              </text>

              {bone.causes.map((cause) => {
                const textX = cause.x - 12;
                const firstLineY = cause.y - ((cause.lines.length - 1) * lh) / 2 + 4;

                return (
                  <g key={cause.text}>
                    <line
                      x1={cause.x - 8}
                      y1={cause.y}
                      x2={cause.x}
                      y2={cause.y}
                      strokeWidth={1.5}
                      className={color.stroke}
                    />
                    <text y={firstLineY} textAnchor="end" className="fill-foreground text-[11px]">
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