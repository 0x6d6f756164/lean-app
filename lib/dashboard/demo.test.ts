import { describe, expect, it } from "vitest";
import type { LeanRecord } from "../../types/lean";
import { summarizeRecord } from "../workspace/summary";
import { combinedPareto, fiveSScores, groupByArea, oeeSeries, taktLines } from "./aggregate";
import { DEMO_PREFIX, createDemoRecords, isDemo, withoutDemo } from "./demo";

const now = new Date("2026-10-08T12:00:00.000Z");
const records = createDemoRecords(now);

describe("createDemoRecords", () => {
  it("creates unique demo ids", () => {
    expect(new Set(records.map((r) => r.id)).size).toBe(records.length);
    expect(records.every((r) => r.id.startsWith(DEMO_PREFIX))).toBe(true);
  });

  it("only creates records the app can read", () => {
    for (const r of records) expect(summarizeRecord(r)).not.toBe("Invalid data");
  });

  it("never dates a record in the future", () => {
    for (const r of records) expect(Date.parse(r.date)).toBeLessThanOrEqual(now.getTime());
  });

  it("feeds every dashboard panel with three areas", () => {
    expect(groupByArea(records)).toHaveLength(3);
    expect(oeeSeries(records)).toHaveLength(3);
    expect(fiveSScores(records)).toHaveLength(3);
    expect(taktLines(records)).toHaveLength(3);
    expect(combinedPareto(records)).not.toBeNull();
  });

  it("shows OEE improving on Packing line 1", () => {
    const line1 = oeeSeries(records).find((s) => s.area === "Packing line 1");
    expect(line1).toBeDefined();
    const points = line1!.points;
    expect(points[points.length - 1].oee).toBeGreaterThan(points[0].oee);
  });
});

describe("isDemo / withoutDemo", () => {
  it("removes demo records and keeps the rest", () => {
    const own: LeanRecord = {
      id: "mine",
      tool: "oee",
      area: "",
      date: now.toISOString(),
      values: {},
    };
    const mixed = [own, ...records];

    expect(isDemo(own)).toBe(false);
    expect(withoutDemo(mixed)).toEqual([own]);
  });
});