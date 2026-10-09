"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { buildNav, type NavLink } from "@/lib/nav";
import { SITE } from "@/lib/site";

const NAV = buildNav();

const tabStyle = (active: boolean) =>
  `block whitespace-nowrap rounded-lg px-3 py-1.5 transition-colors ${
    active
      ? "bg-foreground/10 font-medium text-foreground"
      : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
  }`;

const pillStyle = (active: boolean) =>
  `block whitespace-nowrap rounded-full border px-3 py-1 transition-colors ${
    active
      ? "border-accent bg-accent/10 font-medium text-accent"
      : "border-foreground/20 text-foreground/80 hover:border-accent/50 hover:text-foreground"
  }`;

const menuStyle = (active: boolean) =>
  `block rounded-lg px-3 py-3 text-base transition-colors ${
    active ? "bg-accent/10 font-medium text-accent" : "text-foreground/80 hover:bg-foreground/5"
  }`;

interface NavListProps {
  label: string;
  links: NavLink[];
  pathname: string | null;
  style: (active: boolean) => string;
  onNavigate?: () => void;
  className?: string;
}

function NavList({ label, links, pathname, style, onNavigate, className = "" }: NavListProps) {
  return (
    <ul aria-label={label} className={className}>
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={style(active)}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);

  // The menu is "open for" the page it was opened on, so it closes by itself after navigating.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const close = () => setOpenOn(null);

  return (
    <header
      className="sticky top-0 z-20 border-b border-foreground/10 bg-background/80 backdrop-blur"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          close();
          toggleRef.current?.focus();
        }
      }}
    >
      <nav aria-label="Main" className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/"
          aria-label={SITE.name}
          onClick={close}
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-bold text-on-accent"
          >
            {SITE.logoLetter}
          </span>
          <span>{SITE.name}</span>
        </Link>

        {/* Desktop */}
        <NavList
          label="Tools"
          links={NAV.tools}
          pathname={pathname}
          style={tabStyle}
          className="hidden min-w-0 flex-1 gap-1 overflow-x-auto text-sm lg:flex"
        />
        <NavList
          label="Your data"
          links={NAV.workspace}
          pathname={pathname}
          style={pillStyle}
          className="hidden shrink-0 items-center gap-2 border-l border-foreground/15 pl-4 text-sm lg:flex"
        />

        {/* Mobile */}
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpenOn(open ? null : pathname)}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg border border-foreground/20 lg:hidden"
        >
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            {open ? (
              <>
                <path d="M5 5l10 10" />
                <path d="M15 5L5 15" />
              </>
            ) : (
              <>
                <path d="M3 6h14" />
                <path d="M3 10h14" />
                <path d="M3 14h14" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="lg:hidden">
          <div
            aria-hidden="true"
            onClick={close}
            className="absolute inset-x-0 top-full -z-10 h-dvh bg-black/30"
          />
          <div
            id="mobile-menu"
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--header-height))] overflow-y-auto border-b border-foreground/10 bg-background shadow-lg"
          >
            <div className="mx-auto max-w-6xl space-y-4 px-4 py-4">
              <div>
                <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-foreground/60">
                  Tools
                </p>
                <NavList
                  label="Tools"
                  links={NAV.tools}
                  pathname={pathname}
                  style={menuStyle}
                  onNavigate={close}
                />
              </div>
              <div className="border-t border-foreground/10 pt-4">
                <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-foreground/60">
                  Your data
                </p>
                <NavList
                  label="Your data"
                  links={NAV.workspace}
                  pathname={pathname}
                  style={menuStyle}
                  onNavigate={close}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}