import type { LeanRecord } from "../../types/lean";
import { summarize } from "../lean/fishbone";
import { scoreAudit } from "../lean/fiveS";
import { calcOee } from "../lean/oee";
import { buildPareto } from "../lean/pareto";
import { analyzeLine, availableSeconds, calcTaktTime } from "../lean/takt";
import {
  parseFishboneState,
  parseFiveSState,
  parseOeeState,
  parseParetoState,
  parseTaktState,
} from "../share/states";

const INVALID = "Invalid data";
const pct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function summarizeRecord(record: LeanRecord): string {
  try {
    switch (record.tool) {
      case "takt": {
        const s = parseTaktState(record.values);
        if (!s) return INVALID;
        const takt = calcTaktTime(
          availableSeconds(s.shiftHours, s.breakMinutes, s.shifts),
          s.demand,
        );
        const line = analyzeLine(takt, s.stations);
        const bottleneck = line.bottleneck ? ` · bottleneck ${line.bottleneck.name}` : "";
        return `Takt ${takt.toFixed(1)} s · ${plural(line.minOperators, "operator")}${bottleneck}`;
      }
      case "oee": {
        const s = parseOeeState(record.values);
        if (!s) return INVALID;
        const r = calcOee(s);
        return `OEE ${pct(r.oee)} (A ${pct(r.availability)} · P ${pct(r.performance)} · Q ${pct(r.quality)})`;
      }
      case "pareto": {
        const s = parseParetoState(record.values);
        if (!s) return INVALID;
        const r = buildPareto(s.items, s.cutoff / 100);
        if (r.rows.length === 0) return "No data";
        const share = r.rows[r.vitalCount - 1].cumulativePercent;
        return `${r.vitalCount} of ${r.rows.length} categories cause ${pct(share)} of ${r.total}`;
      }
      case "5s": {
        const s = parseFiveSState(record.values);
        if (!s) return INVALID;
        const r = scoreAudit(s.answers);
        if (r.percent === null || r.rating === null) return "Not rated yet";
        return `${pct(r.percent, 0)} · ${r.rating} · ${r.answered} of ${r.total} rated`;
      }
      case "fishbone": {
        const s = parseFishboneState(record.values);
        if (!s) return INVALID;
        return `${s.problem.trim() || "No problem set"} · ${plural(summarize(s).total, "cause")}`;
      }
      default:
        return INVALID;
    }
  } catch {
    return INVALID;
  }
}