import type { LeanRecord, ToolId } from "../../types/lean";
import { normalizeArea } from "../lean/area";

export const MAX_RECORDS = 200;
export const STORAGE_KEY = "lean-toolkit:records:v1";

const TOOL_IDS: readonly ToolId[] = ["takt", "oee", "pareto", "fishbone", "5s"];

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createRecord(
  tool: ToolId,
  values: unknown,
  area: string,
  now: Date = new Date(),
  id: string = newId(),
): LeanRecord {
  return { id, tool, area: normalizeArea(area), date: now.toISOString(), values };
}

const byNewest = (a: LeanRecord, b: LeanRecord) => Date.parse(b.date) - Date.parse(a.date);

function toRecord(item: unknown): LeanRecord | null {
  if (typeof item !== "object" || item === null) return null;
  const { id, tool, area, date, values } = item as Record<string, unknown>;

  if (typeof id !== "string" || id.length === 0 || id.length > 64) return null;
  if (typeof tool !== "string" || !TOOL_IDS.includes(tool as ToolId)) return null;
  if (typeof date !== "string" || Number.isNaN(Date.parse(date))) return null;
  if (values === undefined || values === null) return null;

  return {
    id,
    tool: tool as ToolId,
    area: typeof area === "string" ? normalizeArea(area) : "",
    date,
    values,
  };
}

/** Reads stored or imported JSON. Invalid entries are dropped; newest first. */
export function parseRecords(raw: string | null): LeanRecord[] {
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const seen = new Set<string>();
  const records: LeanRecord[] = [];
  for (const item of parsed) {
    const record = toRecord(item);
    if (!record || seen.has(record.id)) continue;
    seen.add(record.id);
    records.push(record);
  }
  return records.sort(byNewest).slice(0, MAX_RECORDS);
}

export const serializeRecords = (records: LeanRecord[]): string => JSON.stringify(records);

/** Puts the new record first and drops the oldest ones beyond the limit. */
export function addRecord(records: LeanRecord[], record: LeanRecord): LeanRecord[] {
  return [record, ...records].slice(0, MAX_RECORDS);
}

export function removeRecord(records: LeanRecord[], id: string): LeanRecord[] {
  return records.filter((r) => r.id !== id);
}

/** Adds records whose ids are new; existing records are never overwritten. */
export function mergeRecords(existing: LeanRecord[], incoming: LeanRecord[]): LeanRecord[] {
  const seen = new Set(existing.map((r) => r.id));
  const added = incoming.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
  return [...existing, ...added].sort(byNewest).slice(0, MAX_RECORDS);
}