"use client";

import { useMemo, useSyncExternalStore } from "react";
import { decodeShare, decodeShareArea, extractShared } from "@/lib/share/codec";
import type { ToolId } from "@/types/lean";

const subscribe = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const getHash = () => window.location.hash;
const getServerHash = () => "";

/**
 * Reads shared state from the URL hash. `parse` must be a stable function
 * (declared outside components) that returns null for invalid data.
 */
export function useSharedState<T>(tool: ToolId, parse: (raw: unknown) => T | null) {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash);

  const shared = useMemo(() => {
    const encoded = extractShared(hash);
    if (!encoded) return null;
    const raw = decodeShare(encoded, tool);
    return raw === null ? null : parse(raw);
  }, [hash, tool, parse]);

  return { shared, hash };
}

/** The "Area / line" label stored in the link, or an empty string. */
export function useSharedArea(tool: ToolId | undefined): string {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash);

  return useMemo(() => {
    const encoded = extractShared(hash);
    return tool && encoded ? decodeShareArea(encoded, tool) : "";
  }, [hash, tool]);
}