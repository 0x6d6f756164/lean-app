import { describe, expect, it } from "vitest";
import { calcOee, type OeeInput } from "./oee";

const base: OeeInput = {
  plannedTime: 480,
  breakdownTime: 40,
  setupTime: 20,
  idealCycleTime: 30,
  totalCount: 700,
  goodCount: 665,
};

describe("calcOee", () => {
  it("computes availability, performance and quality", () => {
    const r = calcOee(base);
    expect(r.availability).toBeCloseTo(0.875, 6);
    expect(r.performance).toBeCloseTo(5 / 6, 6);
    expect(r.quality).toBeCloseTo(0.95, 6);
  });

  it("multiplies the three factors into OEE", () => {
    expect(calcOee(base).oee).toBeCloseTo(0.6927, 4);
  });

  it("accounts for every planned minute in the loss breakdown", () => {
    const r = calcOee(base);
    const { breakdowns, setup, speed, defects } = r.losses;
    expect(breakdowns + setup + speed + defects + r.fullyProductiveTime).toBeCloseTo(480, 6);
  });

  it("rejects good count above total count", () => {
    expect(() => calcOee({ ...base, goodCount: 701 })).toThrow(RangeError);
  });

  it("rejects downtime above planned time", () => {
    expect(() => calcOee({ ...base, breakdownTime: 500 })).toThrow(RangeError);
  });

  it("warns when performance exceeds 100%", () => {
    expect(calcOee({ ...base, totalCount: 900, goodCount: 900 }).warnings).toHaveLength(1);
  });
});