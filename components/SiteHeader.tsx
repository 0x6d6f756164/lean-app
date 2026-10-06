"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOOLS } from "@/lib/tools";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-foreground/10">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          Lean Toolkit
        </Link>
        <ul className="flex flex-1 gap-4 overflow-x-auto text-sm">
          {TOOLS.filter((t) => t.ready).map((t) => {
            const active = pathname === t.href;
            return (
              <li key={t.id}>
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "font-medium text-foreground"
                      : "text-foreground/60 hover:text-foreground"
                  }
                >
                  {t.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}