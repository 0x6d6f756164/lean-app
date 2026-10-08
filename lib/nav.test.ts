import { describe, expect, it } from "vitest";
import { buildNavItems } from "./nav";
import type { ToolMeta } from "./tools";

const tools: ToolMeta[] = [
  { id: "takt", name: "Takt Time", tagline: "", href: "/tools/takt", ready: true },
  { id: "oee", name: "OEE", tagline: "", href: "/tools/oee", ready: true },
  { id: "pareto", name: "Pareto", tagline: "", href: "/tools/pareto", ready: false },
];

describe("buildNavItems", () => {
  it("lists ready tools first, then the extra links", () => {
    const items = buildNavItems(tools, [{ label: "Workspace", href: "/workspace" }]);
    expect(items.map((i) => i.label)).toEqual(["Takt Time", "OEE", "Workspace"]);
  });

  it("hides tools that are not ready", () => {
    const items = buildNavItems(tools, []);
    expect(items.some((i) => i.href === "/tools/pareto")).toBe(false);
  });

  it("never lists the same link twice", () => {
    const items = buildNavItems(tools, [
      { label: "Workspace", href: "/workspace" },
      { label: "Workspace again", href: "/workspace" },
      { label: "OEE again", href: "/tools/oee" },
    ]);
    expect(items.map((i) => i.href)).toEqual(["/tools/takt", "/tools/oee", "/workspace"]);
  });

  it("builds a valid list from the real configuration", () => {
    const items = buildNavItems();
    expect(items.length).toBeGreaterThan(0);
    expect(new Set(items.map((i) => i.href)).size).toBe(items.length);
    for (const item of items) expect(item.href.startsWith("/")).toBe(true);
  });
});