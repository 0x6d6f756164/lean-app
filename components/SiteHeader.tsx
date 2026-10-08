"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildNavItems } from "@/lib/nav";
import { SITE } from "@/lib/site";

const NAV_ITEMS = buildNavItems();

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-foreground/10 bg-background/80 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-bold text-on-accent"
          >
            {SITE.logoLetter}
          </span>
          {SITE.name}
        </Link>

        <ul className="flex flex-1 gap-1 overflow-x-auto text-sm">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`block whitespace-nowrap rounded-lg px-3 py-1.5 transition-colors ${
                    active
                      ? "bg-foreground/10 font-medium text-foreground"
                      : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}