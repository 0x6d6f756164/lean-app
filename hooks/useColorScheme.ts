"use client";

import { useSyncExternalStore } from "react";
import type { ChartTheme } from "@/lib/chartTheme";

const QUERY = "(prefers-color-scheme: dark)";

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false;

export function useColorScheme(): ChartTheme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) ? "dark" : "light";
}