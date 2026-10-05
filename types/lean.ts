export type ToolId = "takt" | "oee" | "pareto" | "fishbone" | "5s";

export interface LeanRecord<T = unknown> {
  id: string;
  tool: ToolId;
  area: string;
  date: string; // ISO string
  values: T;
}