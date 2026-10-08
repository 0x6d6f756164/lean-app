"use client";

import Link from "next/link";
import { useRef, type ComponentProps, type PointerEvent } from "react";

export default function SpotlightLink({
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link>) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMove = (e: PointerEvent<HTMLAnchorElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    node.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <Link
      {...props}
      ref={ref}
      onPointerMove={handleMove}
      className={`group relative overflow-hidden ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%)",
        }}
      />
      <div className="relative">{children}</div>
    </Link>
  );
}