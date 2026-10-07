"use client";

import { useMemo, useSyncExternalStore } from "react";
import { decodeShare, extractShared } from "@/lib/share/codec";
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