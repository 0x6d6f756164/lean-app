import {
  CATEGORIES,
  MAX_CAUSES,
  addCause,
  createEmptyData,
  type FishboneData,
} from "../lean/fishbone";
import { MAX_SCORE, PILLARS } from "../lean/fiveS";
import type { ParetoItem } from "../lean/pareto";
import type { Station } from "../lean/takt";

const MAX_STATIONS = 50;
const MAX_PARETO_ITEMS = 100;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isNum = (v: unknown, min = 0, max = 1e9): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;

/** Strings are shortened instead of rejected; null means "not a string". */
const str = (v: unknown, maxLength: number): string | null =>
  typeof v === "string" ? v.slice(0, maxLength) : null;

/* ---------- Takt ---------- */

export interface TaktState {
  shiftHours: number;
  breakMinutes: number;
  shifts: number;
  demand: number;
  stations: Station[];
}

export const DEFAULT_TAKT: TaktState = {
  shiftHours: 8,
  breakMinutes: 60,
  shifts: 1,
  demand: 420,
  stations: [
    { name: "Cut", cycleTime: 55 },
    { name: "Weld", cycleTime: 62 },
    { name: "Paint", cycleTime: 48 },
  ],
};

export function parseTaktState(raw: unknown): TaktState | null {
  if (!isRecord(raw)) return null;
  const { shiftHours, breakMinutes, shifts, demand, stations } = raw;

  if (!isNum(shiftHours, 0, 24) || !isNum(breakMinutes, 0, 1440)) return null;
  if (!isNum(shifts, 1, 10) || !isNum(demand)) return null;
  if (!Array.isArray(stations) || stations.length > MAX_STATIONS) return null;

  const parsed: Station[] = [];
  for (const s of stations) {
    if (!isRecord(s)) return null;
    const name = str(s.name, 60);
    const cycleTime = s.cycleTime;
    if (name === null || !isNum(cycleTime)) return null;
    parsed.push({ name, cycleTime });
  }

  return { shiftHours, breakMinutes, shifts, demand, stations: parsed };
}

/* ---------- OEE ---------- */

export interface OeeState {
  plannedTime: number;
  breakdownTime: number;
  setupTime: number;
  idealCycleTime: number;
  totalCount: number;
  goodCount: number;
}

export const DEFAULT_OEE: OeeState = {
  plannedTime: 480,
  breakdownTime: 40,
  setupTime: 20,
  idealCycleTime: 30,
  totalCount: 700,
  goodCount: 665,
};

export function parseOeeState(raw: unknown): OeeState | null {
  if (!isRecord(raw)) return null;

  const out = { ...DEFAULT_OEE };
  for (const key of Object.keys(DEFAULT_OEE) as (keyof OeeState)[]) {
    const value = raw[key];
    if (!isNum(value)) return null;
    out[key] = value;
  }
  return out;
}

/* ---------- Pareto ---------- */

export interface ParetoState {
  items: ParetoItem[];
  cutoff: number; // percent
}

export const DEFAULT_PARETO: ParetoState = {
  items: [
    { label: "Scratches", count: 45 },
    { label: "Dents", count: 25 },
    { label: "Misalignment", count: 12 },
    { label: "Paint drips", count: 8 },
    { label: "Cracks", count: 5 },
    { label: "Other", count: 5 },
  ],
  cutoff: 80,
};

export function parseParetoState(raw: unknown): ParetoState | null {
  if (!isRecord(raw)) return null;
  const { items, cutoff } = raw;

  if (!isNum(cutoff, 1, 100)) return null;
  if (!Array.isArray(items) || items.length > MAX_PARETO_ITEMS) return null;

  const parsed: ParetoItem[] = [];
  for (const item of items) {
    if (!isRecord(item)) return null;
    const label = str(item.label, 100);
    const count = item.count;
    if (label === null || !isNum(count)) return null;
    parsed.push({ label, count });
  }

  return { items: parsed, cutoff };
}

/* ---------- 5S ---------- */

export interface FiveSState {
  answers: Record<string, number>;
}

export const DEFAULT_FIVE_S: FiveSState = { answers: {} };

export function parseFiveSState(raw: unknown): FiveSState | null {
  if (!isRecord(raw)) return null;
  const rawAnswers = raw.answers;
  if (!isRecord(rawAnswers)) return null;

  const known = new Set(PILLARS.flatMap((p) => p.questions.map((q) => q.id)));
  const answers: Record<string, number> = {};

  for (const [id, value] of Object.entries(rawAnswers)) {
    if (!known.has(id)) continue; // unknown ids (including "__proto__") are ignored
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > MAX_SCORE) {
      return null;
    }
    answers[id] = value;
  }

  return { answers };
}

/* ---------- Fishbone ---------- */

export function parseFishboneState(raw: unknown): FishboneData | null {
  if (!isRecord(raw)) return null;
  const problem = str(raw.problem, 80);
  const rawCauses = raw.causes;
  if (problem === null || !isRecord(rawCauses)) return null;

  // Rebuilt through addCause, so trimming, duplicates and limits are enforced.
  let data = createEmptyData(problem);
  for (const cat of CATEGORIES) {
    const list = rawCauses[cat.id];
    if (list === undefined) continue;
    if (!Array.isArray(list) || list.length > MAX_CAUSES) return null;

    for (const item of list) {
      const text = str(item, 60);
      if (text === null) return null;
      data = addCause(data, cat.id, text);
    }
  }
  return data;
}