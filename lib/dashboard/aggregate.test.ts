import { describe, expect, it } from "vitest";
import type { LeanRecord, ToolId } from "../../types/lean";
import { PILLARS } from "../lean/fiveS";
import { DEFAULT_OEE, DEFAULT_TAKT } from "../share/states";
import {
  UNASSIGNED,
  combinedPareto,
  dashboardKpis,
  filterByArea,
  fiveSScores,
  groupByArea,
  oeeSeries,
  taktLines,
} from "./aggregate";

let counter = 0;
const rec = (tool: ToolId, area: string, date: string, values: unknown): LeanRecord => ({
  id: `r${counter++}`,
  tool,
  area,
  date,
  values,
});

/** Answers every Sort question with `sort` and every Set in order question with `setInOrder`. */
const answers = (sort: number, setInOrder: number) => ({
  answers: Object.fromEntries(
    PILLARS.filter((p) => p.id === "sort" || p.id === "set-in-order").flatMap((p) =>
      p.questions.map((q) => [q.id, p.id === "sort" ? sort : setInOrder]),
    ),
  ),
});

const IMPROVED_OEE = {
  ...DEFAULT_OEE,
  breakdownTime: 20,
  setupTime: 10,
  totalCount: 760,
  goodCount: 745,
};
const DEFAULT_OEE_VALUE = (30 * 665) / 60 / 480; // ideal time of good units / planned time
const IMPROVED_OEE_VALUE = (30 * 745) / 60 / 480;

describe("groupByArea", () => {
  it("groups ignoring case, labels by the newest record and puts 'No area' last", () => {
    const groups = groupByArea([
      rec("oee", "Line 2", "2026-10-01T09:00:00.000Z", DEFAULT_OEE),
      rec("oee", "line 2", "2026-10-05T09:00:00.000Z", DEFAULT_OEE),
      rec("oee", "", "2026-10-03T09:00:00.000Z", DEFAULT_OEE),
      rec("oee", "Assembly", "2026-10-02T09:00:00.000Z", DEFAULT_OEE),
    ]);

    expect(groups.map((g) => g.label)).toEqual(["Assembly", "line 2", UNASSIGNED]);
    const line2 = groups[1];
    expect(line2.records).toHaveLength(2);
    expect(line2.records[0].date).toBe("2026-10-05T09:00:00.000Z"); // newest first
  });
});

describe("filterByArea", () => {
  const records = [
    rec("oee", "Line 2", "2026-10-01T09:00:00.000Z", DEFAULT_OEE),
    rec("oee", "line 2", "2026-10-02T09:00:00.000Z", DEFAULT_OEE),
    rec("oee", "Assembly", "2026-10-03T09:00:00.000Z", DEFAULT_OEE),
  ];

  it("keeps everything for null", () => {
    expect(filterByArea(records, null)).toHaveLength(3);
  });

  it("matches the area key ignoring case", () => {
    expect(filterByArea(records, "line 2")).toHaveLength(2);
  });
});

describe("oeeSeries", () => {
  it("builds one ascending series per area and skips unreadable or unrelated records", () => {
    const series = oeeSeries([
      rec("oee", "Line A", "2026-10-05T09:00:00.000Z", IMPROVED_OEE),
      rec("oee", "Line A", "2026-10-01T09:00:00.000Z", DEFAULT_OEE),
      rec("oee", "Line A", "2026-10-03T09:00:00.000Z", "junk"),
      rec("takt", "Line A", "2026-10-02T09:00:00.000Z", DEFAULT_TAKT),
      rec("oee", "Line B", "2026-10-04T09:00:00.000Z", DEFAULT_OEE),
    ]);

    expect(series.map((s) => s.area)).toEqual(["Line A", "Line B"]);
    const [a] = series;
    expect(a.points).toHaveLength(2);
    expect(a.points[0].time).toBeLessThan(a.points[1].time);
    expect(a.points[0].oee).toBeCloseTo(DEFAULT_OEE_VALUE, 6);
    expect(a.points[1].oee).toBeCloseTo(IMPROVED_OEE_VALUE, 6);
  });
});

describe("combinedPareto", () => {
  it("merges the latest Pareto of each area and ignores older ones", () => {
    const result = combinedPareto([
      rec("pareto", "Area A", "2026-10-01T09:00:00.000Z", {
        cutoff: 80,
        items: [{ label: "Scratches", count: 10 }],
      }),
      rec("pareto", "Area A", "2026-10-05T09:00:00.000Z", {
        cutoff: 80,
        items: [
          { label: "Scratches", count: 30 },
          { label: "Dents", count: 10 },
        ],
      }),
      rec("pareto", "Area B", "2026-10-04T09:00:00.000Z", {
        cutoff: 80,
        items: [
          { label: "scratches", count: 20 },
          { label: "Cracks", count: 5 },
        ],
      }),
    ]);

    expect(result?.areas).toEqual(["Area A", "Area B"]);
    expect(result?.result.total).toBe(65);
    expect(result?.result.rows[0]).toMatchObject({ label: "Scratches", count: 50 });
  });

  it("returns null when there is no Pareto data", () => {
    expect(combinedPareto([rec("oee", "Area A", "2026-10-01T09:00:00.000Z", DEFAULT_OEE)])).toBeNull();
  });
});

describe("fiveSScores", () => {
  it("uses each area's latest audit and names the weakest pillar", () => {
    const scores = fiveSScores([
      rec("5s", "Area A", "2026-10-01T09:00:00.000Z", answers(4, 4)),
      rec("5s", "Area A", "2026-10-05T09:00:00.000Z", answers(4, 1)),
      rec("5s", "Area B", "2026-10-03T09:00:00.000Z", { answers: {} }), // nothing rated: skipped
    ]);

    expect(scores).toHaveLength(1);
    expect(scores[0].area).toBe("Area A");
    expect(scores[0].percent).toBeCloseTo(0.625, 6);
    expect(scores[0].rating).toBe("Needs improvement");
    expect(scores[0].weakest?.name).toBe("Set in order");
    expect(scores[0].weakest?.percent).toBeCloseTo(0.25, 6);
    expect(scores[0].answered).toBe(6);
    expect(scores[0].total).toBe(15);
  });
});

describe("taktLines", () => {
  it("analyzes the latest valid record of each area", () => {
    const lines = taktLines([
      rec("takt", "Line A", "2026-10-01T09:00:00.000Z", DEFAULT_TAKT),
      rec("takt", "Line A", "2026-10-05T09:00:00.000Z", { ...DEFAULT_TAKT, demand: 0 }), // unusable
    ]);

    expect(lines).toHaveLength(1);
    expect(lines[0].taktTime).toBeCloseTo(60, 6);
    expect(lines[0].bottleneck).toEqual({ name: "Weld", cycleTime: 62 });
    expect(lines[0].minOperators).toBe(3);
    expect(lines[0].overTakt).toBe(1);
    expect(lines[0].date).toBe("2026-10-01T09:00:00.000Z"); // fell back to the older record
  });
});

describe("dashboardKpis", () => {
  it("summarizes counts, the latest OEE and the average 5S score", () => {
    const kpis = dashboardKpis([
      rec("oee", "Line A", "2026-10-01T09:00:00.000Z", DEFAULT_OEE),
      rec("oee", "Line B", "2026-10-05T09:00:00.000Z", IMPROVED_OEE),
      rec("5s", "Line A", "2026-10-02T09:00:00.000Z", answers(4, 4)), // 100%
      rec("5s", "Line B", "2026-10-03T09:00:00.000Z", answers(0, 0)), // 0%
    ]);

    expect(kpis.records).toBe(4);
    expect(kpis.areas).toBe(2);
    expect(kpis.latestOee).toBeCloseTo(IMPROVED_OEE_VALUE, 6);
    expect(kpis.averageFiveS).toBeCloseTo(0.5, 6);
  });

  it("reports missing data as null", () => {
    expect(dashboardKpis([])).toEqual({
      records: 0,
      areas: 0,
      latestOee: null,
      averageFiveS: null,
    });
  });
});