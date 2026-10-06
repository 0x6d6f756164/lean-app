export interface ParetoItem {
  label: string;
  count: number;
}

export interface ParetoRow extends ParetoItem {
  percent: number; // 0..1
  cumulativePercent: number; // 0..1
  vital: boolean; // part of the "vital few" up to the cutoff
}

export interface ParetoResult {
  total: number;
  rows: ParetoRow[];
  vitalCount: number;
}

export function buildPareto(items: ParetoItem[], threshold = 0.8): ParetoResult {
  if (!(threshold > 0 && threshold <= 1)) {
    throw new RangeError("Cutoff must be between 0 and 100%");
  }

  // Merge duplicate labels (case-insensitive) and drop empty or non-positive entries
  const merged = new Map<string, ParetoItem>();
  for (const item of items) {
    const label = item.label.trim();
    if (!label || !(item.count > 0)) continue;
    const key = label.toLowerCase();
    const existing = merged.get(key);
    if (existing) existing.count += item.count;
    else merged.set(key, { label, count: item.count });
  }

  const sorted = [...merged.values()].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((sum, i) => sum + i.count, 0);

  let running = 0;
  let cutoffReached = false;
  const rows: ParetoRow[] = sorted.map((item) => {
    const vital = !cutoffReached; // the row that crosses the cutoff is still vital
    running += item.count;
    const cumulativePercent = running / total;
    if (cumulativePercent >= threshold - 1e-9) cutoffReached = true;
    return { ...item, percent: item.count / total, cumulativePercent, vital };
  });

  return { total, rows, vitalCount: rows.filter((r) => r.vital).length };
}

/** Parses pasted text (Excel, CSV or tab-separated): one "label, count" per line. */
export function parseParetoText(text: string): ParetoItem[] {
  const items: ParetoItem[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const match = line.match(/^(.*?)[\t;,]\s*(\d+(?:\.\d+)?)\s*$/);
    if (!match) continue; // skips header rows like "Defect,Count"
    items.push({ label: match[1].trim(), count: Number(match[2]) });
  }
  return items;
}