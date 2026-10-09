import { SITE } from "./site";
import { TOOLS, type ToolMeta } from "./tools";

export interface NavLink {
  label: string;
  href: string;
}

export interface Nav {
  tools: NavLink[];
  workspace: NavLink[];
}

/** Tool tabs and workspace links, with no link ever appearing twice. */
export function buildNav(
  tools: ToolMeta[] = TOOLS,
  workspace: readonly NavLink[] = SITE.workspaceNav,
): Nav {
  const seen = new Set<string>();
  const unique = (links: NavLink[]) =>
    links.filter((link) => {
      if (seen.has(link.href)) return false;
      seen.add(link.href);
      return true;
    });

  return {
    tools: unique(tools.filter((t) => t.ready).map((t) => ({ label: t.name, href: t.href }))),
    workspace: unique([...workspace]),
  };
}