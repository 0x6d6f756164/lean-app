import type { ToolId } from "@/types/lean";

export interface ToolMeta {
  id: ToolId;
  name: string;
  tagline: string;
  href: string;
  ready: boolean;
}

export const TOOLS: ToolMeta[] = [
  {
    id: "takt",
    name: "Takt Time",
    tagline: "Match your pace to customer demand and spot the stations that can't keep up.",
    href: "/tools/takt",
    ready: true,
  },
  {
    id: "oee",
    name: "OEE",
    tagline: "See how much planned time is truly productive and where the losses go.",
    href: "/tools/oee",
    ready: true,
  },
  {
    id: "pareto",
    name: "Pareto Chart",
    tagline: "Find the few causes behind most of your defects.",
    href: "/tools/pareto",
    ready: true,
  },
  {
    id: "fishbone",
    name: "Fishbone Diagram",
    tagline: "Map the root causes of a problem across the 6Ms.",
    href: "/tools/fishbone",
    ready: true,
  },
  {
    id: "5s",
    name: "5S Audit",
    tagline: "Score a work area and track how it improves over time.",
    href: "/tools/5s",
    ready: true,
  },
];