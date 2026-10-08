import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/tools";

// Next treats these three exports specially, so they stay plain literals.
export const alt = "Lean Toolkit: calculators and charts for Lean and industrial engineering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const { og } = SITE;

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
          background: og.background,
          color: og.foreground,
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
              background: og.accent,
              color: og.onAccent,
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            {SITE.logoLetter}
          </div>
          <div style={{ marginLeft: 20, fontSize: 34, fontWeight: 600 }}>{SITE.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>{SITE.tagline}</div>
          <div style={{ marginTop: 28, fontSize: 32, color: og.muted }}>{SITE.description}</div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {TOOLS.filter((t) => t.ready).map((t) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                marginRight: 14,
                marginBottom: 12,
                padding: "10px 22px",
                borderRadius: 999,
                border: `2px solid ${og.border}`,
                fontSize: 26,
                color: "#cbd5e1",
              }}
            >
              {t.name}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}