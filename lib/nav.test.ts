import { describe, expect, it } from "vitest";
import { buildNav } from "./nav";
import type { ToolMeta } from "./tools";

const tools: ToolMeta[] = [
  { id: "takt", name: "Takt Time", tagline: "", href: "/tools/takt", ready: true },
  { id: "oee", name: "OEE", tagline: "", href: "/tools/oee", ready: true },
  { id: "pareto", name: "Pareto", tagline: "", href: "/tools/pareto", ready: false },
];

describe("buildNav", () => {
  it("separates ready tools from workspace links", () => {
    const nav = buildNav(tools, [{ label: "Workspace", href: "/workspace" }]);
    expect(nav.tools.map((l) => l.label)).toEqual(["Takt Time", "OEE"]);
    expect(nav.workspace.map((l) => l.label)).toEqual(["Workspace"]);
  });

  it("hides tools that are not ready", () => {
    expect(buildNav(tools, []).tools.some((l) => l.href === "/tools/pareto")).toBe(false);
  });

  it("never lists the same link twice, even across groups", () => {
    const nav = buildNav(tools, [
      { label: "Workspace", href: "/workspace" },
      { label: "Workspace again", href: "/workspace" },
      { label: "OEE again", href: "/tools/oee" },
    ]);
    expect(nav.tools.map((l) => l.href)).toEqual(["/tools/takt", "/tools/oee"]);
    expect(nav.workspace.map((l) => l.href)).toEqual(["/workspace"]);
  });

  it("builds a valid list from the real configuration", () => {
    const nav = buildNav();
    const all = [...nav.tools, ...nav.workspace];
    expect(nav.tools.length).toBeGreaterThan(0);
    expect(new Set(all.map((l) => l.href)).size).toBe(all.length);
    for (const link of all) expect(link.href.startsWith("/")).toBe(true);
  });
});