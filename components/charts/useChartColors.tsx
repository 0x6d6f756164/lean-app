"use client";

import { useExportState } from "@/components/ExportContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { chartColors } from "@/lib/chartTheme";

/** The export theme while exporting, the page theme otherwise. */
export function useChartColors() {
  const { exporting, theme } = useExportState();
  const pageTheme = useColorScheme();
  return chartColors(exporting ? theme : pageTheme);
}