import type { ToolId } from "../../types/lean";

export const SHARE_VERSION = 1;
export const MAX_ENCODED_LENGTH = 6000;
const PREFIX = "#s=";

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

/** Encodes a tool's state for a link. Throws a RangeError when it won't fit. */
export function encodeShare(tool: ToolId, data: unknown): string {
  const encoded = toBase64Url(JSON.stringify({ v: SHARE_VERSION, tool, data }));
  if (encoded.length > MAX_ENCODED_LENGTH) {
    throw new RangeError("Too much data to fit in a link");
  }
  return encoded;
}

/** Returns the raw data, or null if the payload is invalid or made for another tool. */
export function decodeShare(encoded: string, tool: ToolId): unknown | null {
  if (encoded.length > MAX_ENCODED_LENGTH) return null;
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(encoded));
    if (typeof parsed !== "object" || parsed === null) return null;
    const envelope = parsed as { v?: unknown; tool?: unknown; data?: unknown };
    if (envelope.v !== SHARE_VERSION || envelope.tool !== tool) return null;
    return envelope.data ?? null;
  } catch {
    return null;
  }
}

export function shareHash(tool: ToolId, data: unknown): string {
  return `${PREFIX}${encodeShare(tool, data)}`;
}

export function extractShared(hash: string): string | null {
  return hash.startsWith(PREFIX) && hash.length > PREFIX.length
    ? hash.slice(PREFIX.length)
    : null;
}