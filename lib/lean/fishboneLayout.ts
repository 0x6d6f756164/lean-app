import { CATEGORIES, wrapText, type CategoryId, type FishboneData } from "./fishbone";

export const LAYOUT = {
  width: 920,
  margin: 40,
  columnX: [170, 385, 600],
  boneDx: 70,
  headX: 745,
  headWidth: 160,
  minBoneLength: 150,
  boneSlack: 16,
  lineHeight: 14,
  causeGap: 8,
  causeMaxChars: 22,
  headMaxChars: 16,
  headLineHeight: 16,
} as const;

export interface LaidOutCause {
  text: string;
  lines: string[];
  x: number; // where the cause meets the bone
  y: number; // vertical center of the cause
}

export interface LaidOutBone {
  id: CategoryId;
  name: string;
  index: number; // category index, used for the color
  top: boolean;
  x0: number; // outer end of the bone
  y0: number;
  x1: number; // where the bone meets the spine
  y1: number;
  labelY: number; // top edge of the category label
  causes: LaidOutCause[];
}

export interface FishboneLayout {
  width: number;
  height: number;
  spineY: number;
  head: { x: number; y: number; width: number; height: number; lines: string[] };
  bones: LaidOutBone[];
}

export function layoutFishbone(data: FishboneData): FishboneLayout {
  const L = LAYOUT;

  const wrapped = CATEGORIES.map((cat) =>
    data.causes[cat.id].map((text) => ({ text, lines: wrapText(text, L.causeMaxChars) })),
  );

  const blockHeight = (lineCount: number) => lineCount * L.lineHeight + L.causeGap;
  const stackHeight = (i: number) =>
    wrapped[i].reduce((sum, c) => sum + blockHeight(c.lines.length), 0);

  // Each half is as long as its most crowded bone needs, so a sparse half stays compact.
  const halfLength = (indices: number[]) =>
    Math.max(L.minBoneLength, ...indices.map((i) => stackHeight(i) + L.boneSlack));

  const topLength = halfLength([0, 1, 2]);
  const bottomLength = halfLength([3, 4, 5]);
  const spineY = L.margin + topLength;
  const height = spineY + bottomLength + L.margin;

  const headLines = wrapText(data.problem.trim() || "Problem", L.headMaxChars);
  const headHeight = Math.max(100, headLines.length * L.headLineHeight + 40);

  const bones = CATEGORIES.map((cat, i): LaidOutBone => {
    const top = i < 3;
    const length = top ? topLength : bottomLength;
    const x0 = L.columnX[i % 3];
    const y0 = top ? L.margin : spineY + length;
    const items = wrapped[i];
    const gap = (length - stackHeight(i)) / (items.length + 1);

    // Causes are stacked in order, the free space is shared evenly between them,
    // and each cause is centered in its own block, so none can overlap.
    let used = 0;
    const causes = items.map((item, k): LaidOutCause => {
      const h = blockHeight(item.lines.length);
      const offset = gap * (k + 1) + used + h / 2; // distance from the bone's outer end
      used += h;
      const t = offset / length;
      return {
        text: item.text,
        lines: item.lines,
        x: x0 + L.boneDx * t,
        y: top ? y0 + offset : y0 - offset,
      };
    });

    return {
      id: cat.id,
      name: cat.name,
      index: i,
      top,
      x0,
      y0,
      x1: x0 + L.boneDx,
      y1: spineY,
      labelY: top ? y0 - 32 : y0 + 4,
      causes,
    };
  });

  return {
    width: L.width,
    height,
    spineY,
    head: {
      x: L.headX,
      y: spineY - headHeight / 2,
      width: L.headWidth,
      height: headHeight,
      lines: headLines,
    },
    bones,
  };
}