"use client";

import { createContext, useContext } from "react";
import type { ExportTheme } from "@/lib/exportTheme";

export interface ExportState {
  exporting: boolean;
  theme: ExportTheme;
}

const ExportContext = createContext<ExportState>({ exporting: false, theme: "light" });

export const ExportingProvider = ExportContext.Provider;
export const useExportState = () => useContext(ExportContext);
export const useIsExporting = () => useContext(ExportContext).exporting;