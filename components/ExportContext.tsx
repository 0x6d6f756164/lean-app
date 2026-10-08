"use client";

import { createContext, useContext } from "react";

const ExportingContext = createContext(false);

export const ExportingProvider = ExportingContext.Provider;
export const useIsExporting = () => useContext(ExportingContext);