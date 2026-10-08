import { describe, expect, it } from "vitest";
import type { LeanRecord, ToolId } from "../../types/lean";
import { addCause, createEmptyData } from "../lean/fishbone";
import { DEFAULT_OEE, DEFAULT_PARETO, DEFAULT_TAKT } from "../share/states";
import { summarizeRecord } from "./summary";

const rec = (tool: ToolId, values: unknown): LeanRecord => ({
  id: "x",
  tool,
  area: "",
  date: "2026-10-07T10:00:00.000Z",
  values,
});

describe("summarizeRecord", () => {
  it("summarizes a takt record", () => {
    expect(summarizeRecord(rec("takt", DEFAULT_TAKT))).toBe(
      "Takt 60.0 s · 3 operators · bottleneck Weld",
    );
  });

  it("summarizes an OEE record", () => {
    expect(summarizeRecord(rec("oee", DEFAULT_OEE))).toBe(
      "OEE 69.3% (A 87.5% · P 83.3% · Q 95.0%)",
    );
  });

  it("summarizes a Pareto record", () => {
    expect(summarizeRecord(rec("pareto", DEFAULT_PARETO))).toBe(
      "3 of 6 categories cause 82.0% of 100",
    );
  });

  it("summarizes a 5S record, including an empty one", () => {
    expect(summarizeRecord(rec("5s", { answers: { "sort-1": 4 } }))).toBe(
      "100% · Excellent · 1 of 15 rated",
    );
    expect(summarizeRecord(rec("5s", { answers: {} }))).toBe("Not rated yet");
  });

  it("summarizes a fishbone record", () => {
    const data = addCause(
      addCause(createEmptyData("Late deliveries"), "man", "A"),
      "machine",
      "B",
    );
    expect(summarizeRecord(rec("fishbone", data))).toBe("Late deliveries · 2 causes");

    const single = addCause(createEmptyData(""), "man", "A");
    expect(summarizeRecord(rec("fishbone", single))).toBe("No problem set · 1 cause");
  });

  it("reports invalid or impossible data instead of throwing", () => {
    expect(summarizeRecord(rec("oee", "junk"))).toBe("Invalid data");
    expect(summarizeRecord(rec("takt", { ...DEFAULT_TAKT, demand: 0 }))).toBe("Invalid data");
  });
});