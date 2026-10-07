import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  MAX_CAUSES,
  addCause,
  createEmptyData,
  removeCause,
  summarize,
  wrapText,
} from "./fishbone";

describe("createEmptyData", () => {
  it("creates the six categories, all empty", () => {
    const data = createEmptyData();
    expect(CATEGORIES).toHaveLength(6);
    for (const c of CATEGORIES) expect(data.causes[c.id]).toEqual([]);
  });
});

describe("addCause", () => {
  it("adds a cleaned-up cause without mutating the original", () => {
    const before = createEmptyData();
    const after = addCause(before, "machine", "  Worn   bearings ");
    expect(after.causes.machine).toEqual(["Worn bearings"]);
    expect(before.causes.machine).toEqual([]);
  });

  it("ignores empty text", () => {
    const data = createEmptyData();
    expect(addCause(data, "man", "   ")).toBe(data);
  });

  it("ignores duplicates regardless of case", () => {
    const once = addCause(createEmptyData(), "method", "No standard work");
    expect(addCause(once, "method", "no STANDARD work").causes.method).toHaveLength(1);
  });

  it("stops at the maximum per category", () => {
    let data = createEmptyData();
    for (let i = 0; i < MAX_CAUSES + 3; i++) data = addCause(data, "man", `Cause ${i}`);
    expect(data.causes.man).toHaveLength(MAX_CAUSES);
  });

  it("rejects an unknown category", () => {
    expect(() => addCause(createEmptyData(), "nope" as never, "x")).toThrow(RangeError);
  });
});

describe("removeCause", () => {
  it("removes the cause at the given index", () => {
    let data = addCause(createEmptyData(), "material", "A");
    data = addCause(data, "material", "B");
    expect(removeCause(data, "material", 0).causes.material).toEqual(["B"]);
  });

  it("ignores an out-of-range index", () => {
    const data = addCause(createEmptyData(), "material", "A");
    expect(removeCause(data, "material", 5)).toBe(data);
  });
});

describe("summarize", () => {
  it("reports an empty diagram", () => {
    const s = summarize(createEmptyData());
    expect(s.total).toBe(0);
    expect(s.busiest).toBeNull();
    expect(s.empty).toHaveLength(6);
  });

  it("finds the busiest category and the unexplored ones", () => {
    let data = createEmptyData();
    data = addCause(data, "machine", "A");
    data = addCause(data, "machine", "B");
    data = addCause(data, "man", "C");
    const s = summarize(data);
    expect(s.total).toBe(3);
    expect(s.busiest?.id).toBe("machine");
    expect(s.empty.map((c) => c.id)).toEqual(["method", "material", "measurement", "environment"]);
  });

  it("picks the first category on a tie", () => {
    let data = addCause(createEmptyData(), "method", "A");
    data = addCause(data, "man", "B");
    expect(summarize(data).busiest?.id).toBe("man");
  });
});

describe("wrapText", () => {
  it("wraps on word boundaries", () => {
    expect(wrapText("Late deliveries from the main supplier", 16)).toEqual([
      "Late deliveries",
      "from the main",
      "supplier",
    ]);
  });

  it("keeps every word instead of truncating", () => {
    expect(wrapText("one two three four five six", 9)).toEqual([
      "one two",
      "three",
      "four five",
      "six",
    ]);
  });

  it("splits a single word that is longer than a line", () => {
    expect(wrapText("Supercalifragilistic", 8)).toEqual(["Supercal", "ifragili", "stic"]);
  });

  it("returns nothing for empty text", () => {
    expect(wrapText("   ", 10)).toEqual([]);
  });

  it("rejects an invalid line length", () => {
    expect(() => wrapText("text", 0)).toThrow(RangeError);
  });
});