import { describe, expect, it } from "vitest";
import { MAX_CAUSES, addCause, createEmptyData } from "../lean/fishbone";
import {
  DEFAULT_OEE,
  DEFAULT_PARETO,
  DEFAULT_TAKT,
  parseFishboneState,
  parseFiveSState,
  parseOeeState,
  parseParetoState,
  parseTaktState,
} from "./states";

const roundTrip = (v: unknown) => JSON.parse(JSON.stringify(v));

describe("parseTaktState", () => {
  it("accepts the default state", () => {
    expect(parseTaktState(roundTrip(DEFAULT_TAKT))).toEqual(DEFAULT_TAKT);
  });

  it("rejects things that are not a state", () => {
    for (const v of [null, 42, "x", [], {}]) expect(parseTaktState(v)).toBeNull();
  });

  it("rejects invalid numbers", () => {
    expect(parseTaktState({ ...DEFAULT_TAKT, demand: -5 })).toBeNull();
    expect(parseTaktState({ ...DEFAULT_TAKT, shifts: 0 })).toBeNull();
    expect(parseTaktState({ ...DEFAULT_TAKT, shiftHours: "8" })).toBeNull();
  });

  it("rejects malformed stations", () => {
    expect(parseTaktState({ ...DEFAULT_TAKT, stations: "nope" })).toBeNull();
    expect(parseTaktState({ ...DEFAULT_TAKT, stations: [{ name: "A" }] })).toBeNull();
  });

  it("limits the number of stations", () => {
    const many = Array.from({ length: 51 }, (_, i) => ({ name: `S${i}`, cycleTime: 10 }));
    expect(parseTaktState({ ...DEFAULT_TAKT, stations: many })).toBeNull();
  });
});

describe("parseOeeState", () => {
  it("accepts the default state and drops extra keys", () => {
    expect(parseOeeState(roundTrip({ ...DEFAULT_OEE, extra: 1 }))).toEqual(DEFAULT_OEE);
  });

  it("rejects a missing or non-numeric value", () => {
    const { goodCount: _removed, ...incomplete } = DEFAULT_OEE;
    expect(parseOeeState(incomplete)).toBeNull();
    expect(parseOeeState({ ...DEFAULT_OEE, setupTime: "20" })).toBeNull();
  });
});

describe("parseParetoState", () => {
  it("accepts the default state", () => {
    expect(parseParetoState(roundTrip(DEFAULT_PARETO))).toEqual(DEFAULT_PARETO);
  });

  it("rejects an invalid cutoff or item list", () => {
    expect(parseParetoState({ ...DEFAULT_PARETO, cutoff: 0 })).toBeNull();
    expect(parseParetoState({ ...DEFAULT_PARETO, items: "nope" })).toBeNull();
    expect(
      parseParetoState({ ...DEFAULT_PARETO, items: [{ label: "A", count: "5" }] }),
    ).toBeNull();
  });

  it("shortens very long labels", () => {
    const parsed = parseParetoState({
      ...DEFAULT_PARETO,
      items: [{ label: "x".repeat(300), count: 1 }],
    });
    expect(parsed?.items[0].label).toHaveLength(100);
  });
});

describe("parseFiveSState", () => {
  it("accepts valid answers", () => {
    expect(parseFiveSState({ answers: { "sort-1": 3, "shine-2": 0 } })).toEqual({
      answers: { "sort-1": 3, "shine-2": 0 },
    });
  });

  it("ignores unknown ids, including prototype keys", () => {
    const raw = JSON.parse('{"answers":{"__proto__":{"x":1},"nope":2,"sort-1":3}}');
    expect(parseFiveSState(raw)).toEqual({ answers: { "sort-1": 3 } });
    expect(({} as Record<string, unknown>).x).toBeUndefined();
  });

  it("rejects out-of-range, fractional or missing answers", () => {
    expect(parseFiveSState({ answers: { "sort-1": 5 } })).toBeNull();
    expect(parseFiveSState({ answers: { "sort-1": 2.5 } })).toBeNull();
    expect(parseFiveSState({})).toBeNull();
  });
});

describe("parseFishboneState", () => {
  it("accepts a valid diagram", () => {
    const data = addCause(createEmptyData("Late deliveries"), "man", "Not enough drivers");
    expect(parseFishboneState(roundTrip(data))).toEqual(data);
  });

  it("cleans duplicates and ignores unknown categories", () => {
    const parsed = parseFishboneState({
      problem: "P",
      causes: { man: ["A", " a ", "B"], machine: ["C"], bogus: ["x"] },
    });
    expect(parsed?.causes.man).toEqual(["A", "B"]);
    expect(parsed?.causes.machine).toEqual(["C"]);
    expect(parsed?.causes.method).toEqual([]);
  });

  it("rejects malformed input", () => {
    expect(parseFishboneState({ problem: 5, causes: {} })).toBeNull();
    expect(parseFishboneState({ problem: "P" })).toBeNull();
    expect(parseFishboneState({ problem: "P", causes: { man: [1] } })).toBeNull();
    const tooMany = Array.from({ length: MAX_CAUSES + 1 }, (_, i) => `Cause ${i}`);
    expect(parseFishboneState({ problem: "P", causes: { man: tooMany } })).toBeNull();
  });
});