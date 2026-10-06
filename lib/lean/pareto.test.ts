import { describe, expect, it } from "vitest";
import { buildPareto, parseParetoText } from "./pareto";

const sample = [
  { label: "Cracks", count: 5 },
  { label: "Scratches", count: 45 },
  { label: "Paint drips", count: 8 },
  { label: "Dents", count: 25 },
  { label: "Misalignment", count: 12 },
  { label: "Other", count: 5 },
];

describe("buildPareto", () => {
  it("sorts categories from largest to smallest", () => {
    const { rows } = buildPareto(sample);
    expect(rows.map((r) => r.label).slice(0, 4)).toEqual([
      "Scratches",
      "Dents",
      "Misalignment",
      "Paint drips",
    ]);
  });

  it("computes cumulative percentages ending at 100%", () => {
    const { rows, total } = buildPareto(sample);
    expect(total).toBe(100);
    expect(rows[0].cumulativePercent).toBeCloseTo(0.45, 6);
    expect(rows[1].cumulativePercent).toBeCloseTo(0.7, 6);
    expect(rows[rows.length - 1].cumulativePercent).toBeCloseTo(1, 6);
  });

  it("marks the vital few, including the row that crosses the cutoff", () => {
    const { rows, vitalCount } = buildPareto(sample, 0.8);
    expect(vitalCount).toBe(3); // 45 + 25 + 12 = 82%
    expect(rows.filter((r) => r.vital).map((r) => r.label)).toEqual([
      "Scratches",
      "Dents",
      "Misalignment",
    ]);
  });

  it("merges duplicate labels regardless of case and spacing", () => {
    const { rows } = buildPareto([
      { label: "Dents", count: 10 },
      { label: " dents ", count: 5 },
      { label: "Scratches", count: 20 },
    ]);
    expect(rows.map((r) => [r.label, r.count])).toEqual([
      ["Scratches", 20],
      ["Dents", 15],
    ]);
  });

  it("ignores empty labels and non-positive counts", () => {
    const { rows } = buildPareto([
      { label: "", count: 10 },
      { label: "Zero", count: 0 },
      { label: "Negative", count: -3 },
      { label: "Real", count: 4 },
    ]);
    expect(rows).toHaveLength(1);
  });

  it("handles an empty list", () => {
    expect(buildPareto([])).toEqual({ total: 0, rows: [], vitalCount: 0 });
  });

  it("rejects an invalid cutoff", () => {
    expect(() => buildPareto(sample, 0)).toThrow(RangeError);
    expect(() => buildPareto(sample, 1.5)).toThrow(RangeError);
  });
});

describe("parseParetoText", () => {
  it("parses commas, tabs and semicolons, and skips the header", () => {
    const text = "Defect,Count\nScratches,45\nDents\t25\nPaint, drips; 8\n";
    expect(parseParetoText(text)).toEqual([
      { label: "Scratches", count: 45 },
      { label: "Dents", count: 25 },
      { label: "Paint, drips", count: 8 },
    ]);
  });
});