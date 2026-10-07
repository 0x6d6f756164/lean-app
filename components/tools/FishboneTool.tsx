"use client";

import { useMemo, useState } from "react";
import FishboneChart, { CATEGORY_COLORS } from "@/components/FishboneChart";
import ToolShell from "@/components/ToolShell";
import {
  CATEGORIES,
  MAX_CAUSES,
  addCause,
  createEmptyData,
  removeCause,
  summarize,
  type CategoryId,
  type FishboneData,
} from "@/lib/lean/fishbone";

const EXAMPLE: FishboneData = {
  problem: "Late deliveries to customers",
  causes: {
    man: ["Not enough trained drivers", "Unclear shift handovers"],
    machine: ["Forklift breakdowns", "Label printer jams"],
    method: ["Orders picked in no fixed sequence", "No standard loading plan"],
    material: ["Late supplier shipments", "Damaged packaging"],
    measurement: ["Delivery times not tracked", "Inaccurate stock counts"],
    environment: ["Congested loading dock"],
  },
};

const EMPTY_DRAFTS = Object.fromEntries(CATEGORIES.map((c) => [c.id, ""])) as Record<
  CategoryId,
  string
>;

export default function FishboneTool() {
  const [data, setData] = useState<FishboneData>(EXAMPLE);
  const [drafts, setDrafts] = useState<Record<CategoryId, string>>(EMPTY_DRAFTS);

  const summary = useMemo(() => summarize(data), [data]);

  const submit = (id: CategoryId) => {
    setData((prev) => addCause(prev, id, drafts[id]));
    setDrafts((prev) => ({ ...prev, [id]: "" }));
  };

  const inputs = (
    <div className="space-y-6">
      <label className="block">
        <span className="mb-1 block text-sm">Problem (the effect you want to explain)</span>
        <input
          value={data.problem}
          maxLength={80}
          onChange={(e) => setData((prev) => ({ ...prev, problem: e.target.value }))}
          placeholder="e.g. Late deliveries to customers"
          className="w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat, i) => {
          const causes = data.causes[cat.id];
          const full = causes.length >= MAX_CAUSES;

          return (
            <fieldset
              key={cat.id}
              className="rounded-xl border border-foreground/15 bg-foreground/[0.03] p-4"
            >
              <legend className="sr-only">{cat.name}</legend>

              <div className="mb-3 flex items-start gap-2">
                <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${CATEGORY_COLORS[i].bg}`} />
                <div>
                  <h3 className="font-semibold leading-tight">{cat.name}</h3>
                  <p className="text-xs text-foreground/60">{cat.prompt}</p>
                </div>
              </div>

              <ul className="mb-3 space-y-1.5">
                {causes.map((cause, k) => (
                  <li key={cause} className="flex items-start justify-between gap-2 text-sm">
                    <span>{cause}</span>
                    <button
                      type="button"
                      onClick={() => setData((prev) => removeCause(prev, cat.id, k))}
                      className="shrink-0 rounded px-1.5 text-foreground/60 hover:bg-foreground/10"
                      aria-label={`Remove cause: ${cause}`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
                {causes.length === 0 && (
                  <li className="text-sm text-foreground/50">No causes yet</li>
                )}
              </ul>

              <div className="flex gap-2">
                <input
                  value={drafts[cat.id]}
                  disabled={full}
                  maxLength={60}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submit(cat.id);
                    }
                  }}
                  placeholder={full ? `Max ${MAX_CAUSES} causes` : "Add a cause…"}
                  className="w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-1.5 text-sm disabled:opacity-50"
                  aria-label={`Add a cause under ${cat.name}`}
                />
                <button
                  type="button"
                  disabled={full}
                  onClick={() => submit(cat.id)}
                  className="rounded-lg border border-foreground/20 px-3 text-sm hover:bg-foreground/5 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </fieldset>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setData((prev) => ({ ...createEmptyData(), problem: prev.problem }))}
          className="rounded-lg border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
        >
          Clear all causes
        </button>
        <button
          type="button"
          onClick={() => setData(EXAMPLE)}
          className="rounded-lg border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
        >
          Load example
        </button>
      </div>
    </div>
  );

  const results = (
    <div className="space-y-4">
      <FishboneChart data={data} />

      <div className="space-y-1 text-sm">
        {summary.total === 0 ? (
          <p className="text-foreground/70">Add causes below and they appear on the diagram.</p>
        ) : (
          <>
            <p>
              <strong>{summary.total}</strong> possible causes across{" "}
              {summary.categories.length - summary.empty.length} categories.
              {summary.busiest && (
                <>
                  {" "}
                  Most are under <strong>{summary.busiest.name}</strong> ({summary.busiest.count}).
                </>
              )}
            </p>
            {summary.empty.length > 0 && (
              <p className="text-foreground/70">
                Not explored yet: {summary.empty.map((c) => c.name).join(", ")}.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <ToolShell
      stacked
      title="Fishbone Diagram"
      description="Map the possible root causes of a problem across the 6Ms and see where the team's thinking is thin."
      inputs={inputs}
      results={results}
      explainer={
        <>
          <p>
            A <strong>fishbone (Ishikawa) diagram</strong> organizes the possible causes of a
            problem. The problem sits at the head, and each bone is a category of causes: the 6Ms
            are Man, Machine, Method, Material, Measurement and Environment.
          </p>
          <p>
            It's a brainstorming tool, so the causes listed are hypotheses and not yet facts. Look
            for categories with no causes, since that's often where the team hasn't looked. Then
            verify the likely ones with data (a Pareto chart works well for this) or dig deeper with
            the 5 Whys.
          </p>
        </>
      }
    />
  );
}