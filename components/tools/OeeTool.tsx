"use client";

import { useMemo, useState } from "react";
import NumberField from "@/components/NumberField";
import ToolShell from "@/components/ToolShell";
import { calcOee } from "@/lib/lean/oee";

import { useSharedState } from "@/hooks/useSharedState";
import { DEFAULT_OEE, parseOeeState, type OeeState } from "@/lib/share/states";

import AnimatedNumber from "@/components/fx/AnimatedNumber";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default function OeeTool() {
  const { shared, hash } = useSharedState("oee", parseOeeState);
  return <OeeForm key={shared ? hash : "default"} initial={shared ?? DEFAULT_OEE} />;
}

function OeeForm({ initial }: { initial: OeeState }) {
  const [plannedTime, setPlannedTime] = useState(initial.plannedTime);
  const [breakdownTime, setBreakdownTime] = useState(initial.breakdownTime);
  const [setupTime, setSetupTime] = useState(initial.setupTime);
  const [idealCycleTime, setIdealCycleTime] = useState(initial.idealCycleTime);
  const [totalCount, setTotalCount] = useState(initial.totalCount);
  const [goodCount, setGoodCount] = useState(initial.goodCount);

  const result = useMemo(() => {
    try {
      return {
        ok: true as const,
        data: calcOee({ plannedTime, breakdownTime, setupTime, idealCycleTime, totalCount, goodCount }),
      };
    } catch (e) {
      return { ok: false as const, message: e instanceof Error ? e.message : "Invalid input" };
    }
  }, [plannedTime, breakdownTime, setupTime, idealCycleTime, totalCount, goodCount]);

  const inputs = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <NumberField label="Planned production time" unit="min" value={plannedTime} onChange={setPlannedTime} />
      <NumberField label="Ideal cycle time" unit="s/unit" value={idealCycleTime} onChange={setIdealCycleTime} step={0.5} />
      <NumberField label="Breakdown time" unit="min" value={breakdownTime} onChange={setBreakdownTime} />
      <NumberField label="Setup & adjustment time" unit="min" value={setupTime} onChange={setSetupTime} />
      <NumberField label="Total units produced" value={totalCount} onChange={setTotalCount} />
      <NumberField label="Good units" value={goodCount} onChange={setGoodCount} />
    </div>
  );

  let results;
  if (!result.ok) {
    results = <p className="text-red-500">{result.message}</p>;
  } else {
    const r = result.data;
    const factors = [
      { label: "Availability", value: r.availability },
      { label: "Performance", value: r.performance },
      { label: "Quality", value: r.quality },
    ];
    const segments = [
      { label: "Breakdowns", minutes: r.losses.breakdowns, color: "bg-red-500" },
      { label: "Setup & adjustments", minutes: r.losses.setup, color: "bg-orange-400" },
      { label: "Reduced speed & small stops", minutes: Math.max(0, r.losses.speed), color: "bg-amber-400" },
      { label: "Defects & rework", minutes: r.losses.defects, color: "bg-purple-500" },
      { label: "Fully productive", minutes: r.fullyProductiveTime, color: "bg-emerald-500" },
    ];

    results = (
      <div className="space-y-6">
        <div>
          <div className="text-5xl font-semibold tabular-nums"><AnimatedNumber value={r.oee} format={pct} /></div>
          <div className="text-sm text-foreground/60">
            OEE · 85% is often cited as world class
          </div>
        </div>

        <div className="space-y-3">
          {factors.map((f) => (
            <div key={f.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{f.label}</span>
                <span className="tabular-nums text-foreground/70">{pct(f.value)}</span>
              </div>
              <div className="h-3 rounded-full bg-foreground/10">
                <div
                  className="h-3 rounded-full bg-sky-500"
                  style={{ width: `${Math.min(100, f.value * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Where the planned time went</h3>
          <div className="flex h-4 overflow-hidden rounded-full bg-foreground/10">
            {segments.map((s) => (
              <div
                key={s.label}
                className={s.color}
                style={{ width: `${(s.minutes / plannedTime) * 100}%` }}
                title={`${s.label}: ${s.minutes.toFixed(1)} min`}
              />
            ))}
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {segments.map((s) => (
              <li key={s.label} className="flex items-center gap-2">
                <span className={`inline-block h-3 w-3 rounded-sm ${s.color}`} />
                <span className="flex-1">{s.label}</span>
                <span className="tabular-nums text-foreground/70">{s.minutes.toFixed(1)} min</span>
              </li>
            ))}
          </ul>
        </div>

        {r.warnings.map((w) => (
          <p key={w} className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-600">
            {w}
          </p>
        ))}
      </div>
    );
  }

  return (
    <ToolShell
      title="OEE Calculator"
      description="Measure how much of your planned production time is truly productive, and see which losses are costing you the most."
      inputs={inputs}
      results={results}
      share={{
        tool: "oee",
        data: { plannedTime, breakdownTime, setupTime, idealCycleTime, totalCount, goodCount },
      }}
      explainer={
        <>
          <p>
            <strong>OEE</strong> = Availability × Performance × Quality. Availability is the share of
            planned time the machine actually ran. Performance compares real output with the ideal
            rate. Quality is the share of good units.
          </p>
          <p>
            The loss bar maps onto the six big losses: breakdowns and setup (availability), reduced
            speed and small stops (performance, grouped here because they're hard to separate from
            totals alone), and defects (quality).
          </p>
        </>
      }
    />
  );
}