import { describe, expect, it } from "vitest";
import type { LeanRecord } from "../../types/lean";
import {
  MAX_RECORDS,
  addRecord,
  createRecord,
  mergeRecords,
  newId,
  parseRecords,
  removeRecord,
} from "./records";

const rec = (n: number, over: Partial<LeanRecord> = {}): LeanRecord => ({
  id: `id-${n}`,
  tool: "oee",
  area: "",
  date: new Date(Date.UTC(2026, 9, n)).toISOString(),
  values: { a: n },
  ...over,
});

describe("createRecord", () => {
  it("builds a record from its inputs", () => {
    const record = createRecord(
      "oee",
      { a: 1 },
      "  Line   2 ",
      new Date("2026-10-07T10:00:00Z"),
      "fixed",
    );
    expect(record).toEqual({
      id: "fixed",
      tool: "oee",
      area: "Line 2",
      date: "2026-10-07T10:00:00.000Z",
      values: { a: 1 },
    });
  });

  it("generates different ids", () => {
    expect(newId()).not.toBe(newId());
  });
});

describe("addRecord / removeRecord", () => {
  it("puts the new record first and drops the oldest beyond the limit", () => {
    const existing = Array.from({ length: MAX_RECORDS }, (_, i) => rec(1, { id: `old-${i}` }));
    const result = addRecord(existing, rec(2, { id: "new" }));
    expect(result).toHaveLength(MAX_RECORDS);
    expect(result[0].id).toBe("new");
    expect(result[result.length - 1].id).toBe(`old-${MAX_RECORDS - 2}`);
  });

  it("removes a record by id", () => {
    expect(removeRecord([rec(1), rec(2)], "id-1").map((r) => r.id)).toEqual(["id-2"]);
  });
});

describe("parseRecords", () => {
  it("returns an empty list for missing or broken input", () => {
    for (const raw of [null, "", "not json", '{"a":1}', "42"]) {
      expect(parseRecords(raw)).toEqual([]);
    }
  });

  it("keeps valid records, newest first", () => {
    const raw = JSON.stringify([rec(1), rec(3), rec(2)]);
    expect(parseRecords(raw).map((r) => r.id)).toEqual(["id-3", "id-2", "id-1"]);
  });

  it("drops invalid entries", () => {
    const raw = JSON.stringify([
      rec(1),
      { ...rec(2), tool: "nope" },
      { ...rec(3), date: "not a date" },
      { ...rec(4), values: null },
      { ...rec(5), id: "" },
      "text",
      null,
    ]);
    expect(parseRecords(raw).map((r) => r.id)).toEqual(["id-1"]);
  });

  it("keeps the first of two records with the same id", () => {
    const raw = JSON.stringify([rec(1), rec(1, { values: { a: 99 } })]);
    const result = parseRecords(raw);
    expect(result).toHaveLength(1);
    expect(result[0].values).toEqual({ a: 1 });
  });

  it("cleans the area", () => {
    expect(parseRecords(JSON.stringify([rec(1, { area: "  Line   2 " })]))[0].area).toBe("Line 2");
  });

  it("limits the number of records", () => {
    const many = Array.from({ length: MAX_RECORDS + 50 }, (_, i) => rec(1, { id: `id-${i}` }));
    expect(parseRecords(JSON.stringify(many))).toHaveLength(MAX_RECORDS);
  });
});

describe("mergeRecords", () => {
  it("adds only unseen ids, never overwrites, and sorts newest first", () => {
    const merged = mergeRecords(
      [rec(2)],
      [rec(2, { values: { a: 99 } }), rec(1), rec(3)],
    );
    expect(merged.map((r) => r.id)).toEqual(["id-3", "id-2", "id-1"]);
    expect(merged[1].values).toEqual({ a: 2 });
  });
});