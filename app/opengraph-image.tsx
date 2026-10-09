import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

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
          alignItems: "center",
          justifyContent: "center",
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
      </div>
    ),
    { ...size },
  );
}