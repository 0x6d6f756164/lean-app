"use client";

import { useEffect, useRef, useState } from "react";
import { useIsExporting } from "@/components/ExportContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { tween } from "@/lib/animation";

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
  duration?: number; // ms
  className?: string;
}

/** Counts up on first render and glides to new values. Shows the final value when exporting. */
export default function AnimatedNumber({
  value,
  format,
  duration = 600,
  className,
}: AnimatedNumberProps) {
  const exporting = useIsExporting();
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const lastShown = useRef(0);

  useEffect(() => {
    if (reduced) return;
    const from = lastShown.current;
    if (from === value) return;

    const startedAt = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress = (now - startedAt) / duration;
      const next = progress >= 1 ? value : tween(from, value, progress);
      lastShown.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduced]);

  return <span className={className}>{format(exporting || reduced ? value : display)}</span>;
}