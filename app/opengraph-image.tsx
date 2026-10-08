import { ImageResponse } from "next/og";

export const alt = "Lean Toolkit: calculators and charts for Lean and industrial engineering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TOOL_NAMES = ["Takt Time", "OEE", "Pareto Chart", "5S Audit", "Fishbone Diagram"];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0b0e13",
          color: "#e8ecf1",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#38bdf8",
              color: "#04121c",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            L
          </div>
          <div style={{ marginLeft: 20, fontSize: 34, fontWeight: 600 }}>Lean Toolkit</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
            Lean tools that show their work
          </div>
          <div style={{ marginTop: 28, fontSize: 32, color: "#9aa7b8" }}>
            Calculators and charts for industrial engineering, in your browser.
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {TOOL_NAMES.map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                marginRight: 14,
                marginBottom: 12,
                padding: "10px 22px",
                borderRadius: 999,
                border: "2px solid #2b3442",
                fontSize: 26,
                color: "#cbd5e1",
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}