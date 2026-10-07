export const CATEGORIES = [
  { id: "man", name: "Man (People)", prompt: "Skills, training, workload, communication" },
  { id: "machine", name: "Machine", prompt: "Equipment, tools, maintenance, technology" },
  { id: "method", name: "Method", prompt: "Procedures, standards, process steps" },
  { id: "material", name: "Material", prompt: "Raw materials, parts, suppliers, quality" },
  { id: "measurement", name: "Measurement", prompt: "Inspection, data, gauges, metrics" },
  { id: "environment", name: "Environment", prompt: "Layout, temperature, noise, culture" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const MAX_CAUSES = 8; // per category, so the diagram stays readable

export interface FishboneData {
  problem: string;
  causes: Record<CategoryId, string[]>;
}

export function createEmptyData(problem = ""): FishboneData {
  const causes = Object.fromEntries(
    CATEGORIES.map((c) => [c.id, [] as string[]]),
  ) as Record<CategoryId, string[]>;
  return { problem, causes };
}

/** Adds a cause. Empty text, duplicates and a full category are ignored. */
export function addCause(data: FishboneData, categoryId: CategoryId, text: string): FishboneData {
  const list = data.causes[categoryId];
  if (!list) throw new RangeError(`Unknown category: ${categoryId}`);

  const cleaned = text.trim().replace(/\s+/g, " ");
  if (!cleaned || list.length >= MAX_CAUSES) return data;
  if (list.some((c) => c.toLowerCase() === cleaned.toLowerCase())) return data;

  return { ...data, causes: { ...data.causes, [categoryId]: [...list, cleaned] } };
}

export function removeCause(data: FishboneData, categoryId: CategoryId, index: number): FishboneData {
  const list = data.causes[categoryId];
  if (!list) throw new RangeError(`Unknown category: ${categoryId}`);
  if (!Number.isInteger(index) || index < 0 || index >= list.length) return data;

  return {
    ...data,
    causes: { ...data.causes, [categoryId]: list.filter((_, i) => i !== index) },
  };
}

export interface CategorySummary {
  id: CategoryId;
  name: string;
  count: number;
}

export interface FishboneSummary {
  total: number;
  categories: CategorySummary[];
  busiest: CategorySummary | null; // the first one wins ties
  empty: CategorySummary[]; // categories with no causes yet
}

export function summarize(data: FishboneData): FishboneSummary {
  const categories = CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    count: data.causes[c.id].length,
  }));
  const total = categories.reduce((sum, c) => sum + c.count, 0);
  const busiest =
    total === 0 ? null : categories.reduce((max, c) => (c.count > max.count ? c : max));

  return { total, categories, busiest, empty: categories.filter((c) => c.count === 0) };
}


/** Wraps text on word boundaries without ever dropping words; very long words are split. */
export function wrapText(text: string, maxChars: number): string[] {
  if (!(maxChars >= 1)) throw new RangeError("maxChars must be at least 1");

  const lines: string[] = [];
  let current = "";

  for (const word of text.trim().split(/\s+/).filter(Boolean)) {
    let rest = word;

    while (rest.length > maxChars) {
      if (current) {
        lines.push(current);
        current = "";
      }
      lines.push(rest.slice(0, maxChars));
      rest = rest.slice(maxChars);
    }

    const candidate = current ? `${current} ${rest}` : rest;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      lines.push(current);
      current = rest;
    }
  }

  if (current) lines.push(current);
  return lines;
}