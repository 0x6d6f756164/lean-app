import type { LeanRecord, ToolId } from "../../types/lean";
import { PILLARS } from "../lean/fiveS";
import { DEFAULT_TAKT } from "../share/states";

export const DEMO_PREFIX = "demo-";
const DAY = 24 * 60 * 60 * 1000;

export const isDemo = (record: LeanRecord) => record.id.startsWith(DEMO_PREFIX);
export const withoutDemo = (records: LeanRecord[]) => records.filter((r) => !isDemo(r));

/** Weekly OEE readings per area, oldest first: [breakdown min, setup min, units made, good units]. */
const OEE_DEMO = [
  {
    code: "l1",
    area: "Packing line 1",
    endOffset: 0,
    readings: [
      [70, 30, 620, 560],
      [60, 30, 640, 590],
      [55, 25, 670, 625],
      [45, 25, 690, 655],
      [40, 20, 710, 680],
      [35, 20, 730, 705],
    ],
  },
  {
    code: "l2",
    area: "Packing line 2",
    endOffset: 1,
    readings: [
      [50, 30, 660, 600],
      [45, 25, 680, 635],
      [40, 25, 695, 660],
      [40, 20, 705, 675],
    ],
  },
  {
    code: "asm",
    area: "Assembly",
    endOffset: 2,
    readings: [
      [80, 40, 580, 520],
      [70, 35, 610, 565],
      [60, 30, 640, 600],
    ],
  },
];

const oeeValues = ([breakdownTime, setupTime, totalCount, goodCount]: number[]) => ({
  plannedTime: 480,
  breakdownTime,
  setupTime,
  idealCycleTime: 30,
  totalCount,
  goodCount,
});

/** Takes 15 scores in question order (Sort first, Sustain last). */
const fiveSValues = (scores: number[]) => ({
  answers: Object.fromEntries(
    PILLARS.flatMap((p) => p.questions).map((q, i) => [q.id, scores[i]]),
  ),
});

export function createDemoRecords(now: Date = new Date()): LeanRecord[] {
  const records: LeanRecord[] = [];
  const add = (id: string, tool: ToolId, area: string, daysAgo: number, values: unknown) => {
    records.push({
      id: `${DEMO_PREFIX}${id}`,
      tool,
      area,
      date: new Date(now.getTime() - daysAgo * DAY).toISOString(),
      values,
    });
  };

  for (const { code, area, endOffset, readings } of OEE_DEMO) {
    readings.forEach((reading, i) => {
      const weeksAgo = readings.length - 1 - i;
      add(`oee-${code}-${i}`, "oee", area, weeksAgo * 7 + endOffset, oeeValues(reading));
    });
  }

  add("pareto-l1", "pareto", "Packing line 1", 2, {
    cutoff: 80,
    items: [
      { label: "Scratches", count: 38 },
      { label: "Misalignment", count: 21 },
      { label: "Dents", count: 14 },
      { label: "Paint drips", count: 9 },
      { label: "Other", count: 6 },
    ],
  });
  add("pareto-l2", "pareto", "Packing line 2", 3, {
    cutoff: 80,
    items: [
      { label: "Scratches", count: 26 },
      { label: "Dents", count: 18 },
      { label: "Label errors", count: 11 },
      { label: "Cracks", count: 7 },
    ],
  });
  add("pareto-asm", "pareto", "Assembly", 4, {
    cutoff: 80,
    items: [
      { label: "Misalignment", count: 33 },
      { label: "Loose screws", count: 24 },
      { label: "Scratches", count: 9 },
      { label: "Cracks", count: 6 },
    ],
  });

  add("5s-l1-old", "5s", "Packing line 1", 28, fiveSValues([3, 3, 3, 2, 2, 2, 3, 2, 2, 1, 2, 1, 1, 1, 1]));
  add("5s-l1", "5s", "Packing line 1", 1, fiveSValues([4, 3, 4, 3, 3, 2, 3, 3, 3, 2, 2, 2, 2, 1, 2]));
  add("5s-l2", "5s", "Packing line 2", 2, fiveSValues([4, 4, 3, 4, 3, 3, 3, 4, 3, 3, 3, 2, 3, 2, 3]));
  add("5s-asm", "5s", "Assembly", 3, fiveSValues([3, 2, 3, 2, 2, 1, 2, 2, 2, 1, 1, 2, 1, 0, 1]));

  add("takt-l1", "takt", "Packing line 1", 3, DEFAULT_TAKT);
  add("takt-l2", "takt", "Packing line 2", 4, {
    shiftHours: 8,
    breakMinutes: 60,
    shifts: 1,
    demand: 500,
    stations: [
      { name: "Cut", cycleTime: 50 },
      { name: "Weld", cycleTime: 56 },
      { name: "Paint", cycleTime: 52 },
    ],
  });
  add("takt-asm", "takt", "Assembly", 5, {
    shiftHours: 8,
    breakMinutes: 60,
    shifts: 1,
    demand: 400,
    stations: [
      { name: "Prep", cycleTime: 60 },
      { name: "Fit", cycleTime: 66 },
      { name: "Test", cycleTime: 64 },
    ],
  });

  return records;
}