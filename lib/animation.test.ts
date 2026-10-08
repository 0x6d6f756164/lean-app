import { describe, expect, it } from "vitest";
import { clamp01, easeOutCubic, tween } from "./animation";

describe("clamp01", () => {
  it("limits values to 0..1", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(3)).toBe(1);
  });
});

describe("easeOutCubic", () => {
  it("starts at 0 and ends at 1", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });

  it("moves faster at the start than a linear ramp", () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });

  it("never decreases", () => {
    let previous = 0;
    for (let i = 1; i <= 20; i++) {
      const value = easeOutCubic(i / 20);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });
});

describe("tween", () => {
  it("returns the endpoints", () => {
    expect(tween(10, 20, 0)).toBe(10);
    expect(tween(10, 20, 1)).toBe(20);
  });

  it("works downwards", () => {
    expect(tween(20, 10, 1)).toBe(10);
    expect(tween(20, 10, 0.5)).toBeLessThan(15);
  });

  it("does not overshoot", () => {
    expect(tween(10, 20, 2)).toBe(20);
  });
});