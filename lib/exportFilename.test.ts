import { describe, expect, it } from "vitest";
import { exportFilename, formatDate } from "./exportFilename";

const day = new Date(2026, 9, 6); // 6 October 2026, local time

describe("formatDate", () => {
  it("pads the month and the day", () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(formatDate(day)).toBe("2026-10-06");
  });
});

describe("exportFilename", () => {
  it("builds a readable filename from the tool title", () => {
    expect(exportFilename("OEE Calculator", day)).toBe("oee-calculator-2026-10-06.png");
    expect(exportFilename("5S Audit", day)).toBe("5s-audit-2026-10-06.png");
  });

  it("removes accents and punctuation", () => {
    expect(exportFilename("Qualité & Délais!", day)).toBe("qualite-delais-2026-10-06.png");
  });

  it("falls back to a default name for an empty title", () => {
    expect(exportFilename("   ", day)).toBe("lean-toolkit-2026-10-06.png");
  });
  it("includes the area when given", () => {
  expect(exportFilename("OEE Calculator", day, "Packing line 2")).toBe(
    "oee-calculator-packing-line-2-2026-10-06.png",
  );
  });
});