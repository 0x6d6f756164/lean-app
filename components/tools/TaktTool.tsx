"use client";

import { useMemo, useState } from "react";
import NumberField from "@/components/NumberField";
import ToolShell from "@/components/ToolShell";
import { analyzeLine, calcTaktTime, type Station } from "@/lib/lean/takt";

export default function TaktTool() {
  const [shiftHours, setShiftHours] = useState(8);
  const [breakMinutes, setBreakMinutes] = useState(60);
  const [shifts, setShifts] = useState(1);
  const [demand, setDemand] = useState(420);
  const [stations, setStations] = useState<Station[]>([
    { name: "Cut", cycleTime: 55 },
    { name: "Weld", cycleTime: 62 },
    { name: "Paint", cycleTime: 48 },
  ]);

  const result = useMemo(() => {
    const availableTime = (shiftHours * 60 - breakMinutes) * 60 * shifts; // seconds
    try {
      const takt = calcTaktTime(availableTime, demand);
      return { ok: true as const, availableTime, takt, line: analyzeLine(takt, stations) };
    } catch (e) {
      return { ok: false as const, message: e instanceof Error ? e.message : "Invalid input" };
    }
  }, [shiftHours, breakMinutes, shifts, demand, stations]);

  const updateStation = (i: number, patch: Partial<Station>) =>
    setStations((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const addStation = () =>
    setStations((prev) => [...prev, { name: `Station ${prev.length + 1}`, cycleTime: 30 }]);
  const removeStation = (i: number) =>
    setStations((prev) => prev.filter((_, idx) => idx !== i));

  const inputs = (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <NumberField label="Shift length" unit="h" value={shiftHours} onChange={setShiftHours} step={0.5} />
        <NumberField label="Breaks per shift" unit="min" value={breakMinutes} onChange={setBreakMinutes} />
        <NumberField label="Shifts per day" value={shifts} onChange={setShifts} min={1} />
        <NumberField label="Customer demand per day" unit="units" value={demand} onChange={setDemand} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Stations (cycle time in seconds)</h3>
        <div className="space-y-2">
          {stations.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={s.name}
                onChange={(e) => updateStation(i, { name: e.target.value })}
                className="w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2"
                aria-label={`Station ${i + 1} name`}
              />
              <input
                type="number"
                min={0}
                value={s.cycleTime}
                onChange={(e) => updateStation(i, { cycleTime: e.target.valueAsNumber || 0 })}
                className="w-28 rounded-lg border border-foreground/20 bg-transparent px-3 py-2"
                aria-label={`Station ${i + 1} cycle time`}
              />
              <button
                type="button"
                onClick={() => removeStation(i)}
                className="rounded-lg px-3 text-foreground/60 hover:bg-foreground/10"
                aria-label={`Remove station ${i + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStation}
          className="mt-3 rounded-lg border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
        >
          + Add station
        </button>
      </div>
    </div>
  );

  let results;
  if (!result.ok) {
    results = <p className="text-red-500">{result.message}</p>;
  } else {
    const { takt, line, availableTime } = result;
    const scale = Math.max(takt, ...line.stations.map((s) => s.cycleTime)) * 1.1;
    const taktPct = (takt / scale) * 100;

    results = (
      <div className="space-y-6">
        <div>
          <div className="text-5xl font-semibold tabular-nums">{takt.toFixed(1)} s</div>
          <div className="text-sm text-foreground/60">takt time per unit</div>
        </div>

        <dl className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-foreground/60">Available time</dt>
            <dd className="font-medium">{(availableTime / 3600).toFixed(1)} h</dd>
          </div>
          <div>
            <dt className="text-foreground/60">Total cycle time</dt>
            <dd className="font-medium">{line.totalCycleTime} s</dd>
          </div>
          <div>
            <dt className="text-foreground/60">Min. operators</dt>
            <dd className="font-medium">{line.minOperators}</dd>
          </div>
        </dl>

        {line.bottleneck && (
          <p className="text-sm">
            Bottleneck: <strong>{line.bottleneck.name}</strong> ({line.bottleneck.cycleTime} s)
          </p>
        )}

        <div className="space-y-3">
          {line.stations.map((s, i) => (
            <div key={i}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{s.name}</span>
                <span className="tabular-nums text-foreground/70">
                  {s.cycleTime}s · {Math.round(s.utilization * 100)}%
                </span>
              </div>
              <div className="relative h-3 rounded-full bg-foreground/10">
                <div
                  className={`h-3 rounded-full ${s.overTakt ? "bg-red-500" : "bg-emerald-500"}`}
                  style={{ width: `${(s.cycleTime / scale) * 100}%` }}
                />
                <div
                  className="absolute -top-1 -bottom-1 w-0.5 bg-foreground"
                  style={{ left: `${taktPct}%` }}
                  title="Takt time"
                />
              </div>
            </div>
          ))}
          <p className="text-xs text-foreground/60">
            The vertical line is takt time. Red bars are slower than takt and can't keep up with demand.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ToolShell
      title="Takt Time Calculator"
      description="Find the pace at which you must produce to meet customer demand, and check which stations can't keep up."
      inputs={inputs}
      results={results}
      explainer={
        <>
          <p>
            <strong>Takt time</strong> = available production time ÷ customer demand. It's the
            heartbeat of the line: one unit must be completed every takt.
          </p>
          <p>
            Compare it with each station's cycle time. A station slower than takt is a
            bottleneck. Minimum operators = total cycle time ÷ takt, rounded up.
          </p>
        </>
      }
    />
  );
}