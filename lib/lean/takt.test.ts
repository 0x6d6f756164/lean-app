import { describe, expect, it } from "vitest";
import { analyzeLine, calcTaktTime, availableSeconds } from "./takt";


describe("calcTaktTime", () => {
  it("divides available time by demand", () => {
    expect(calcTaktTime(27000, 450)).toBe(60);
  });

  it("rejects zero demand", () => {
    expect(() => calcTaktTime(27000, 0)).toThrow(RangeError);
  });
});

describe("analyzeLine", () => {
  const stations = [
    { name: "Cut", cycleTime: 55 },
    { name: "Weld", cycleTime: 62 },
    { name: "Paint", cycleTime: 48 },
  ];

  it("finds the bottleneck and over-takt stations", () => {
    const result = analyzeLine(60, stations);
    expect(result.bottleneck?.name).toBe("Weld");
    expect(result.stations.filter((s) => s.overTakt).map((s) => s.name)).toEqual(["Weld"]);
  });

  it("computes the minimum number of operators", () => {
    expect(analyzeLine(60, stations).minOperators).toBe(3); // 165 / 60 = 2.75
  });
});

describe("availableSeconds", () => {
  it("subtracts breaks and multiplies by shifts", () => {
    expect(availableSeconds(8, 60, 1)).toBe(27000);
    expect(availableSeconds(8, 60, 2)).toBe(54000);
  });
});