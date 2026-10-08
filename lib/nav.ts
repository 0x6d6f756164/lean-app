import { SITE } from "./site";
import { TOOLS, type ToolMeta } from "./tools";

export interface NavItem {
  label: string;
  href: string;
}

/** Ready tools first, then the extra links. A link never appears twice. */
export function buildNavItems(
  tools: ToolMeta[] = TOOLS,
  extra: readonly NavItem[] = SITE.extraNav,
): NavItem[] {
  const items: NavItem[] = [
    ...tools.filter((t) => t.ready).map((t) => ({ label: t.name, href: t.href })),
    ...extra,
  ];

  const seen = new Set<string>();
  const unique: NavItem[] = [];
  for (const item of items) {
    if (seen.has(item.href)) continue;
    seen.add(item.href);
    unique.push(item);
  }
  return unique;
}