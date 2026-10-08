import type { LeanRecord, ToolId } from "../../types/lean";
import { scoreAudit, type Rating } from "../lean/fiveS";
import { calcOee } from "../lean/oee";
import { buildPareto, type ParetoItem, type ParetoResult } from "../lean/pareto";
import { analyzeLine, availableSeconds, calcTaktTime } from "../lean/takt";
import {
  parseFiveSState,
  parseOeeState,
  parseParetoState,
  parseTaktState,
} from "../share/states";

export const UNASSIGNED = "No area";
export const PARETO_CUTOFF = 0.8;

const UNASSIGNED_KEY = UNASSIGNED.toLowerCase();
const time = (r: LeanRecord) => Date.parse(r.date);
const areaLabel = (r: LeanRecord) => r.area || UNASSIGNED;
const areaKey = (r: LeanRecord) => areaLabel(r).toLowerCase();

/* ---------- Areas ---------- */

export interface AreaGroup {
  key: string; // lowercase, used for matching and filtering
  label: string; // spelling of the newest record
  records: LeanRecord[]; // newest first
}

/** Groups records by area, ignoring case. "No area" always comes last. */
export function groupByArea(records: LeanRecord[]): AreaGroup[] {
  const buckets = new Map<string, LeanRecord[]>();
  for (const r of records) {
    const key = areaKey(r);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(r);
    else buckets.set(key, [r]);
  }

  const groups = [...buckets].map(([key, list]) => {
    const sorted = [...list].sort((a, b) => time(b) - time(a));
    return { key, label: areaLabel(sorted[0]), records: sorted };
  });

  return groups.sort((a, b) => {
    const aLast = a.key === UNASSIGNED_KEY;
    const bLast = b.key === UNASSIGNED_KEY;
    if (aLast !== bLast) return aLast ? 1 : -1;
    return a.label.localeCompare(b.label);
  });
}

/** `null` keeps every record. */
export function filterByArea(records: LeanRecord[], key: string | null): LeanRecord[] {
  return key === null ? records : records.filter((r) => areaKey(r) === key);
}

/** The newest record of a tool that can actually be read, or null. */
function firstValid<T>(
  group: AreaGroup,
  tool: ToolId,
  build: (record: LeanRecord) => T | null,
): T | null {
  for (const r of group.records) {
    if (r.tool !== tool) continue;
    const built = build(r);
    if (built) return built;
  }
  return null;
}

/* ---------- OEE over time ---------- */

export interface OeePoint {
  time: number;
  date: string;
  oee: number;
}

export interface OeeSeries {
  key: string;
  area: string;
  points: OeePoint[]; // oldest first
}

function oeeOf(record: LeanRecord): number | null {
  const state = parseOeeState(record.values);
  if (!state) return null;
  try {
    return calcOee(state).oee;
  } catch {
    return null;
  }
}

export function oeeSeries(records: LeanRecord[]): OeeSeries[] {
  const series: OeeSeries[] = [];
  for (const group of groupByArea(records)) {
    const points: OeePoint[] = [];
    for (const r of group.records) {
      if (r.tool !== "oee") continue;
      const oee = oeeOf(r);
      if (oee !== null) points.push({ time: time(r), date: r.date, oee });
    }
    if (points.length === 0) continue;
    points.sort((a, b) => a.time - b.time);
    series.push({ key: group.key, area: group.label, points });
  }
  return series;
}

/* ---------- Combined Pareto ---------- */

export interface CombinedPareto {
  result: ParetoResult;
  areas: string[];
}

/** Merges the latest Pareto of every area, so repeated saves are never double-counted. */
export function combinedPareto(records: LeanRecord[]): CombinedPareto | null {
  const items: ParetoItem[] = [];
  const areas: string[] = [];

  for (const group of groupByArea(records)) {
    const state = firstValid(group, "pareto", (r) => parseParetoState(r.values));
    if (!state) continue;
    items.push(...state.items);
    areas.push(group.label);
  }

  const result = buildPareto(items, PARETO_CUTOFF);
  return result.rows.length === 0 ? null : { result, areas };
}

/* ---------- 5S ---------- */

export interface FiveSArea {
  key: string;
  area: string;
  date: string;
  percent: number; // 0..1
  rating: Rating;
  answered: number;
  total: number;
  weakest: { name: string; percent: number } | null;
}

export function fiveSScores(records: LeanRecord[]): FiveSArea[] {
  const scores: FiveSArea[] = [];

  for (const group of groupByArea(records)) {
    const entry = firstValid(group, "5s", (r): FiveSArea | null => {
      const state = parseFiveSState(r.values);
      if (!state) return null;

      const audit = scoreAudit(state.answers);
      if (audit.percent === null || audit.rating === null) return null; // nothing rated yet

      const weakest =
        audit.weakest && audit.weakest.percent !== null
          ? { name: audit.weakest.name, percent: audit.weakest.percent }
          : null;

      return {
        key: group.key,
        area: group.label,
        date: r.date,
        percent: audit.percent,
        rating: audit.rating,
        answered: audit.answered,
        total: audit.total,
        weakest,
      };
    });
    if (entry) scores.push(entry);
  }
  return scores;
}

/* ---------- Takt ---------- */

export interface TaktArea {
  key: string;
  area: string;
  date: string;
  taktTime: number; // seconds
  bottleneck: { name: string; cycleTime: number } | null;
  minOperators: number;
  overTakt: number; // stations slower than takt
}

export function taktLines(records: LeanRecord[]): TaktArea[] {
  const lines: TaktArea[] = [];

  for (const group of groupByArea(records)) {
    const entry = firstValid(group, "takt", (r): TaktArea | null => {
      const state = parseTaktState(r.values);
      if (!state) return null;
      try {
        const takt = calcTaktTime(
          availableSeconds(state.shiftHours, state.breakMinutes, state.shifts),
          state.demand,
        );
        const line = analyzeLine(takt, state.stations);
        return {
          key: group.key,
          area: group.label,
          date: r.date,
          taktTime: takt,
          bottleneck: line.bottleneck
            ? { name: line.bottleneck.name, cycleTime: line.bottleneck.cycleTime }
            : null,
          minOperators: line.minOperators,
          overTakt: line.stations.filter((s) => s.overTakt).length,
        };
      } catch {
        return null;
      }
    });
    if (entry) lines.push(entry);
  }
  return lines;
}

/* ---------- KPIs ---------- */

export interface Kpis {
  records: number;
  areas: number;
  latestOee: number | null; // the most recent reading in any area
  averageFiveS: number | null; // mean of each area's latest score
}

export function dashboardKpis(records: LeanRecord[]): Kpis {
  let latest: OeePoint | null = null;
  for (const s of oeeSeries(records)) {
    const last = s.points[s.points.length - 1];
    if (!latest || last.time > latest.time) latest = last;
  }

  const scores = fiveSScores(records);
  return {
    records: records.length,
    areas: groupByArea(records).length,
    latestOee: latest ? latest.oee : null,
    averageFiveS: scores.length
      ? scores.reduce((sum, s) => sum + s.percent, 0) / scores.length
      : null,
  };
}