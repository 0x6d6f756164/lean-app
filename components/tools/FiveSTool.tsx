"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/components/ToolShell";
import { MAX_SCORE, PILLARS, scoreAudit, type Rating } from "@/lib/lean/fiveS";

import { useSharedState } from "@/hooks/useSharedState";
import { DEFAULT_FIVE_S, parseFiveSState, type FiveSState } from "@/lib/share/states";

import AnimatedNumber from "@/components/fx/AnimatedNumber";

const SCORES = Array.from({ length: MAX_SCORE + 1 }, (_, i) => i);
const pct = (n: number) => `${Math.round(n * 100)}%`;

const RATING_COLOR: Record<Rating, string> = {
  Excellent: "bg-emerald-500",
  Good: "bg-emerald-400",
  "Needs improvement": "bg-amber-400",
  Poor: "bg-red-500",
};

import { ratingFor } from "@/lib/lean/fiveS";

export default function FiveSTool() {
  const { shared, hash } = useSharedState("5s", parseFiveSState);
  return <FiveSForm key={shared ? hash : "default"} initial={shared ?? DEFAULT_FIVE_S} />;
}

function FiveSForm({ initial }: { initial: FiveSState }) {
  const [answers, setAnswers] = useState<Record<string, number>>(initial.answers);
  const result = useMemo(() => scoreAudit(answers), [answers]);

  const setAnswer = (id: string, value: number) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const inputs = (
  <div className="space-y-6">

    <p className="text-sm text-foreground/70">
      Rate each statement from <strong>0</strong> (not done at all) to{" "}
      <strong>{MAX_SCORE}</strong> (fully in place and sustained). Unrated questions are left
      out of the score.
    </p>

    {PILLARS.map((pillar, pi) => (
      <fieldset
        key={pillar.id}
        className="min-w-0 rounded-xl border border-foreground/15 bg-foreground/[0.03] p-4"
      >
        <legend className="sr-only">{pillar.name}</legend>

        <div className="mb-4 flex items-center gap-3 border-b border-foreground/10 pb-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-semibold text-white">
            {pi + 1}
          </span>
          <div>
            <h3 className="font-semibold leading-tight">{pillar.name}</h3>
            <p className="text-xs text-foreground/60">{pillar.japanese}</p>
          </div>
        </div>

        <div className="space-y-5">
          {pillar.questions.map((q) => (
            <div key={q.id}>
              <p className="text-sm text-foreground">{q.text}</p>
              <div role="radiogroup" aria-label={q.text} className="mt-2 flex gap-1.5">
                {SCORES.map((v) => (
                  <label key={v} className="cursor-pointer">
                    <input
                      type="radio"
                      name={q.id}
                      value={v}
                      checked={answers[q.id] === v}
                      onChange={() => setAnswer(q.id, v)}
                      className="peer sr-only"
                    />
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-foreground/20 text-sm peer-checked:border-sky-500 peer-checked:bg-sky-500 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500">
                      {v}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>
    ))}

    <button
      type="button"
      onClick={() => setAnswers({})}
      className="rounded-lg border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
    >
      Reset answers
    </button>
  </div>
);

  let results;
  if (result.percent === null || result.rating === null) {
    results = <p className="text-foreground/70">Rate at least one question to see a score.</p>;
  } else {
    const weakestPillar = result.weakest
      ? PILLARS.find((p) => p.id === result.weakest!.id)
      : undefined;

    results = (
      <div className="space-y-6">
        <div>
          <div className="text-5xl font-semibold tabular-nums"><AnimatedNumber value={result.percent} format={pct} /></div>
          <div className="text-sm text-foreground/60">
            {result.rating} · {result.answered} of {result.total} questions rated
            {!result.complete && " (score covers rated questions only)"}
          </div>
        </div>

        <div className="space-y-3">
          {result.pillars.map((p) => (
            <div key={p.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="tabular-nums text-foreground/70">
                  {p.percent === null ? "not rated" : pct(p.percent)}
                </span>
              </div>
              <div className="h-3 rounded-full bg-foreground/10">
                {p.percent !== null && (
                  <div
                    className={`h-3 rounded-full ${RATING_COLOR[ratingFor(p.percent)]}`}
                    style={{ width: `${p.percent * 100}%` }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {result.weakest && weakestPillar && (
          <div className="rounded-lg bg-foreground/5 p-4 text-sm">
            <p className="font-medium">
              Start with {weakestPillar.name} ({pct(result.weakest.percent ?? 0)})
            </p>
            <p className="mt-1 text-foreground/80">{weakestPillar.tip}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <ToolShell
      title="5S Audit"
      description="Score a work area against the five S's and see which one to fix first."
      inputs={inputs}
      results={results}
      share={{ tool: "5s", data: { answers } }}
      explainer={
        <>
          <p>
            <strong>5S</strong> is a workplace organization method: Sort, Set in order, Shine,
            Standardize and Sustain. The first three create an orderly area, and the last two keep
            it that way.
          </p>
          <p>
            Rate how well each statement is met, from 0 (not done) to {MAX_SCORE} (fully in
            place). The overall score is the average of the rated questions. The rating bands
            (90% and up, 75%, 50%) are a common rule of thumb, so adapt them to your own audit
            standard.
          </p>
        </>
      }
    />
  );
}