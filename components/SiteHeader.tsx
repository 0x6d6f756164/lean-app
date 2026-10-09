"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildNav } from "@/lib/nav";
import { SITE } from "@/lib/site";

const NAV = buildNav();

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-foreground/10 bg-background/80 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/"
          aria-label={SITE.name}
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-bold text-on-accent"
          >
            {SITE.logoLetter}
          </span>
          <span className="hidden sm:inline">{SITE.name}</span>
        </Link>

        <ul aria-label="Tools" className="flex min-w-0 flex-1 gap-1 overflow-x-auto text-sm">
          {NAV.tools.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`block whitespace-nowrap rounded-lg px-3 py-1.5 transition-colors ${
                    active
                      ? "bg-foreground/10 font-medium text-foreground"
                      : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <ul
          aria-label="Your data"
          className="flex shrink-0 items-center gap-2 border-l border-foreground/15 pl-4 text-sm"
        >
          {NAV.workspace.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`block whitespace-nowrap rounded-full border px-3 py-1 transition-colors ${
                    active
                      ? "border-accent bg-accent/10 font-medium text-accent"
                      : "border-foreground/20 text-foreground/80 hover:border-accent/50 hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}