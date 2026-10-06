import { describe, expect, it } from "vitest";
import { MAX_SCORE, PILLARS, ratingFor, scoreAudit } from "./fiveS";

const fillAll = (value: number) =>
  Object.fromEntries(PILLARS.flatMap((p) => p.questions.map((q) => [q.id, value])));

const fillPillar = (pillarId: string, value: number) =>
  Object.fromEntries(
    PILLARS.filter((p) => p.id === pillarId).flatMap((p) => p.questions.map((q) => [q.id, value])),
  );

describe("audit definition", () => {
  it("has five pillars with unique question ids", () => {
    expect(PILLARS).toHaveLength(5);
    const ids = PILLARS.flatMap((p) => p.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("scoreAudit", () => {
  it("gives 100% and Excellent when everything is fully in place", () => {
    const r = scoreAudit(fillAll(MAX_SCORE));
    expect(r.percent).toBeCloseTo(1, 6);
    expect(r.rating).toBe("Excellent");
    expect(r.complete).toBe(true);
    expect(r.answered).toBe(15);
  });

  it("gives 0% and Poor when nothing is done", () => {
    const r = scoreAudit(fillAll(0));
    expect(r.percent).toBe(0);
    expect(r.rating).toBe("Poor");
  });

  it("returns no score before anything is answered", () => {
    const r = scoreAudit({});
    expect(r.percent).toBeNull();
    expect(r.rating).toBeNull();
    expect(r.weakest).toBeNull();
    expect(r.complete).toBe(false);
  });

  it("excludes unanswered questions instead of counting them as zero", () => {
    const r = scoreAudit(fillPillar("sort", MAX_SCORE));
    expect(r.pillars[0].percent).toBe(1);
    expect(r.pillars[1].percent).toBeNull();
    expect(r.percent).toBe(1);
    expect(r.answered).toBe(3);
    expect(r.complete).toBe(false);
  });

  it("finds the weakest pillar", () => {
    const r = scoreAudit({ ...fillPillar("sort", 4), ...fillPillar("set-in-order", 1) });
    expect(r.weakest?.id).toBe("set-in-order");
  });

  it("averages partially answered pillars correctly", () => {
    const r = scoreAudit({ "sort-1": 4, "sort-2": 2 }); // (4 + 2) / (2 * 4)
    expect(r.pillars[0].percent).toBeCloseTo(0.75, 6);
  });

  it("rejects invalid scores", () => {
    expect(() => scoreAudit({ "sort-1": 5 })).toThrow(RangeError);
    expect(() => scoreAudit({ "sort-1": -1 })).toThrow(RangeError);
    expect(() => scoreAudit({ "sort-1": 2.5 })).toThrow(RangeError);
  });
});

describe("ratingFor", () => {
  it("applies the rating bands at their boundaries", () => {
    expect(ratingFor(0.9)).toBe("Excellent");
    expect(ratingFor(0.89)).toBe("Good");
    expect(ratingFor(0.75)).toBe("Good");
    expect(ratingFor(0.5)).toBe("Needs improvement");
    expect(ratingFor(0.49)).toBe("Poor");
  });
});