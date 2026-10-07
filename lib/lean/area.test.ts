import { describe, expect, it } from "vitest";
import { MAX_AREA_LENGTH, normalizeArea } from "./area";

describe("normalizeArea", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeArea("  Packing   line \t 2 ")).toBe("Packing line 2");
  });

  it("limits the length without leaving a trailing space", () => {
    const result = normalizeArea(`${"a".repeat(MAX_AREA_LENGTH - 1)} bbbb`);
    expect(result).toHaveLength(MAX_AREA_LENGTH - 1);
    expect(result.endsWith(" ")).toBe(false);
  });

  it("keeps an empty area empty", () => {
    expect(normalizeArea("   ")).toBe("");
  });
});