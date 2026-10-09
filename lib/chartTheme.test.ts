import { describe, expect, it } from "vitest";
import { chartColors, type ChartTheme } from "./chartTheme";

const THEMES: ChartTheme[] = ["light", "dark"];

describe("chartColors", () => {
  it("uses only explicit colors, never CSS variables or color-mix", () => {
    for (const theme of THEMES) {
      for (const [name, value] of Object.entries(chartColors(theme))) {
        expect(value, `${theme}.${name}`).toMatch(/^(#[0-9a-f]{6}|rgba\([\d., ]+\))$/i);
      }
    }
  });

  it("gives the two themes different text and accent colors", () => {
    const light = chartColors("light");
    const dark = chartColors("dark");
    expect(light.ink).not.toBe(dark.ink);
    expect(light.accent).not.toBe(dark.accent);
    expect(light.headText).not.toBe(dark.headText);
  });

  it("keeps the fishbone head text different from the head fill", () => {
    for (const theme of THEMES) {
      const c = chartColors(theme);
      expect(c.headText).not.toBe(c.ink);
    }
  });
});