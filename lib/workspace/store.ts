import type { LeanRecord } from "../../types/lean";
import {
  STORAGE_KEY,
  addRecord,
  mergeRecords,
  parseRecords,
  removeRecord,
  serializeRecords,
} from "./records";

const EMPTY: LeanRecord[] = [];
let cachedRaw: string | null | undefined;
let cachedRecords: LeanRecord[] = EMPTY;
const listeners = new Set<() => void>();

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Returns the same array until the stored data changes (required by useSyncExternalStore). */
export function getRecords(): LeanRecord[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedRecords = parseRecords(raw);
  }
  return cachedRecords;
}

export const getServerRecords = (): LeanRecord[] => EMPTY;

function write(records: LeanRecord[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeRecords(records));
  } catch {
    return false; // storage is full or blocked
  }
  listeners.forEach((listener) => listener());
  return true;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener); // changes made in other tabs
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export const saveRecord = (record: LeanRecord): boolean =>
  write(addRecord(getRecords(), record));

export const deleteRecord = (id: string): boolean => write(removeRecord(getRecords(), id));

export const clearRecords = (): boolean => write([]);

/** Merges imported records and returns how many were new. */
export function importRecords(incoming: LeanRecord[]): number {
  const before = getRecords();
  const merged = mergeRecords(before, incoming);
  return write(merged) ? merged.length - before.length : 0;
}