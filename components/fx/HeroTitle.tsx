"use client";

import BlurText from "@/components/ui/BlurText";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const TITLE_CLASS = "text-4xl font-semibold tracking-tight sm:text-5xl";

/** An animated title with a static, screen-reader-friendly heading next to it. */
export default function HeroTitle({ text }: { text: string }) {
  const reduced = useReducedMotion();

  return (
    <>
      <h1 className="sr-only">{text}</h1>
      <div aria-hidden="true">
        {reduced ? (
          <p className={TITLE_CLASS}>{text}</p>
        ) : (
          <BlurText
            text={text}
            delay={120}
            animateBy="words"
            direction="top"
            className={TITLE_CLASS}
          />
        )}
      </div>
    </>
  );
}