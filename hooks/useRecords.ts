"use client";

import { useSyncExternalStore } from "react";
import { getRecords, getServerRecords, subscribe } from "@/lib/workspace/store";

const noopSubscribe = () => () => {};

/** `ready` is false during server rendering, so pages can avoid flashing an empty state. */
export function useRecords() {
  const records = useSyncExternalStore(subscribe, getRecords, getServerRecords);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return { records, ready };
}