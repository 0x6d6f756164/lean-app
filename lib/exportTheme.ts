export type ExportTheme = "light" | "dark";

export const EXPORT_THEMES: ExportTheme[] = ["light", "dark"];

export const EXPORT_BACKGROUND: Record<ExportTheme, string> = {
  light: "#ffffff",
  dark: "#0b0e13",
};

export const exportThemeClass = (theme: ExportTheme) => `export-${theme}`;