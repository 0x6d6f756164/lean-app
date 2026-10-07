export const MAX_AREA_LENGTH = 60;

export function normalizeArea(text: string): string {
  return text.trim().replace(/\s+/g, " ").slice(0, MAX_AREA_LENGTH).trim();
}