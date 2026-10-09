export type ChartTheme = "light" | "dark";

export interface ChartColors {
  ink: string; // main text, fishbone head
  inkSoft: string; // category labels
  inkMuted: string; // axis labels, spine, cutoff line
  grid: string;
  barMuted: string;
  headText: string; // text on the fishbone head
  accent: string;
  warn: string; // cumulative line
}

const INK: Record<ChartTheme, [number, number, number]> = {
  light: [20, 24, 31], // #14181f
  dark: [232, 236, 241], // #e8ecf1
};

const rgba = ([r, g, b]: [number, number, number], alpha: number) =>
  `rgba(${r}, ${g}, ${b}, ${alpha})`;

/** Plain color values only: no CSS variables, no classes, so image capture can't lose them. */
export function chartColors(theme: ChartTheme): ChartColors {
  const ink = INK[theme];
  const light = theme === "light";

  return {
    ink: rgba(ink, 1),
    inkSoft: rgba(ink, 0.7),
    inkMuted: rgba(ink, 0.6),
    grid: rgba(ink, 0.1),
    barMuted: rgba(ink, 0.25),
    headText: light ? "#ffffff" : "#0b0e13",
    accent: light ? "#0369a1" : "#38bdf8",
    warn: light ? "#d97706" : "#fbbf24",
  };
}