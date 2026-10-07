import { describe, expect, it } from "vitest";
import { CATEGORIES, addCause, createEmptyData, type CategoryId } from "./fishbone";
import { LAYOUT, layoutFishbone } from "./fishboneLayout";

const build = (entries: [CategoryId, string][]) =>
  entries.reduce((data, [id, text]) => addCause(data, id, text), createEmptyData("Test problem"));

const crowded = (id: CategoryId) =>
  Array.from({ length: 8 }, (_, i): [CategoryId, string] => [
    id,
    `Operators are not trained on the new machine setup ${i}`,
  ]);

const blockHeight = (lineCount: number) => lineCount * LAYOUT.lineHeight + LAYOUT.causeGap;

describe("layoutFishbone", () => {
  it("uses the minimum size for an empty diagram", () => {
    const layout = layoutFishbone(createEmptyData("Test"));
    expect(layout.bones).toHaveLength(CATEGORIES.length);
    expect(layout.spineY).toBe(LAYOUT.margin + LAYOUT.minBoneLength);
    expect(layout.height).toBe(2 * (LAYOUT.margin + LAYOUT.minBoneLength));
  });

  it("places every cause on its bone, between the outer end and the spine", () => {
    const layout = layoutFishbone(
      build([...crowded("man"), ...crowded("machine"), ["measurement", "A"], ["environment", "B"]]),
    );

    for (const bone of layout.bones) {
      for (const cause of bone.causes) {
        const [near, far] = bone.top ? [bone.y0, layout.spineY] : [layout.spineY, bone.y0];
        expect(cause.y).toBeGreaterThan(near);
        expect(cause.y).toBeLessThan(far);
        expect(cause.x).toBeGreaterThan(bone.x0);
        expect(cause.x).toBeLessThan(bone.x1);
      }
    }
  });

  it("keeps the full text of a cause across its lines", () => {
    const text = "Operators are not trained on the new machine setup";
    const cause = layoutFishbone(build([["man", text]])).bones[0].causes[0];

    expect(cause.lines.join(" ")).toBe(text);
    expect(Math.max(...cause.lines.map((l) => l.length))).toBeLessThanOrEqual(LAYOUT.causeMaxChars);
  });

  it("never overlaps causes on the same bone", () => {
    const { causes } = layoutFishbone(build(crowded("man"))).bones[0];

    for (let i = 1; i < causes.length; i++) {
      const spacing = causes[i].y - causes[i - 1].y;
      const needed =
        (blockHeight(causes[i].lines.length) + blockHeight(causes[i - 1].lines.length)) / 2;
      expect(spacing).toBeGreaterThanOrEqual(needed - 1e-9);
    }
  });

  it("grows only the half that is crowded", () => {
    const layout = layoutFishbone(build(crowded("man")));
    expect(layout.spineY).toBeGreaterThan(LAYOUT.margin + LAYOUT.minBoneLength);
    expect(layout.height - layout.spineY).toBe(LAYOUT.minBoneLength + LAYOUT.margin);
  });

  it("grows the head box for a long problem statement", () => {
    const problem = "Customer complaints about late and damaged deliveries from the north warehouse";
    const layout = layoutFishbone(createEmptyData(problem));
    expect(layout.head.lines.join(" ")).toBe(problem);
    expect(layout.head.height).toBeGreaterThan(100);
  });
});