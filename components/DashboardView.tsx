"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import OeeTrendChart, { SERIES_COLORS } from "@/components/charts/OeeTrendChart";
import AnimatedNumber from "@/components/fx/AnimatedNumber";
import ParetoChart from "@/components/ParetoChart";
import { useRecords } from "@/hooks/useRecords";
import {
  PARETO_CUTOFF,
  combinedPareto,
  dashboardKpis,
  filterByArea,
  fiveSScores,
  groupByArea,
  oeeSeries,
  taktLines,
} from "@/lib/dashboard/aggregate";
import { isDemo } from "@/lib/dashboard/demo";
import type { Rating } from "@/lib/lean/fiveS";
import { loadDemoRecords, removeDemoRecords } from "@/lib/workspace/store";

const pct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;
const integer = (n: number) => Math.round(n).toString();
const buttonClass =
  "rounded-lg border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5";

const RATING_BAR: Record<Rating, string> = {
  Excellent: "bg-emerald-500",
  Good: "bg-emerald-400",
  "Needs improvement": "bg-amber-400",
  Poor: "bg-red-500",
};

function Kpi({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-surface p-5 shadow-sm">
      <div className="text-sm text-foreground/60">{label}</div>
      <div className="mt-1 text-3xl font-semibold tabular-nums">{children}</div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-foreground/10 bg-surface p-6 shadow-sm ${className}`}
    >
      <h2 className="font-semibold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-foreground/60">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyPanel({ tool }: { tool: string }) {
  return (
    <p className="text-sm text-foreground/60">
      No {tool} records yet. Save one from the {tool} tool and it will show up here.
    </p>
  );
}

export default function DashboardView() {
  const { records, ready } = useRecords();
  const [selected, setSelected] = useState("all");

  const [message, setMessage] = useState("");

  const handleLoadDemo = () => {
    const added = loadDemoRecords();
    setMessage(added > 0 ? `Loaded ${added} demo records.` : "");
  };

  const handleRemoveDemo = () => {
    const own = records.filter((r) => !isDemo(r)).length;
    const removed = removeDemoRecords();
    setMessage(
      `Removed ${removed} demo ${removed === 1 ? "record" : "records"}. ` +
        (own === 0
          ? "Nothing else is saved."
          : `${own} of your own ${own === 1 ? "record remains" : "records remain"}.`),
    );
  };

  const groups = useMemo(() => groupByArea(records), [records]);
  const activeKey = groups.some((g) => g.key === selected) ? selected : "all";
  const scoped = useMemo(
    () => filterByArea(records, activeKey === "all" ? null : activeKey),
    [records, activeKey],
  );

  const kpis = useMemo(() => dashboardKpis(scoped), [scoped]);
  const series = useMemo(() => oeeSeries(scoped), [scoped]);
  const pareto = useMemo(() => combinedPareto(scoped), [scoped]);
  const fiveS = useMemo(() => fiveSScores(scoped), [scoped]);
  const takt = useMemo(() => taktLines(scoped), [scoped]);

  const hasDemo = records.some(isDemo);
  const vitalShare = pareto
    ? pareto.result.rows[pareto.result.vitalCount - 1].cumulativePercent
    : 0;

  return (
    <main className="mx-auto max-w-6xl animate-fade-up px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-foreground/70">
            What your saved results add up to, area by area. It reads the records in your
            workspace, which live in this browser only.
          </p>
        </div>

        {ready && records.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-foreground/60">Area</span>
              <select
                value={activeKey}
                onChange={(e) => setSelected(e.target.value)}
                className="rounded-lg border border-foreground/20 bg-surface px-3 py-1.5"
              >
                <option value="all">All areas</option>
                {groups.map((g) => (
                  <option key={g.key} value={g.key}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>
            {hasDemo ? (
              <button type="button" className={buttonClass} onClick={handleRemoveDemo}>
                Remove demo data
              </button>
            ) : (
              <button type="button" className={buttonClass} onClick={handleLoadDemo}>
                Load demo data
              </button>
            )}
          </div>
        )}
      </header>

      {message && (
        <p role="status" className="mt-4 text-sm text-foreground/70">
          {message}
        </p>
      )}

      {ready && records.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-foreground/20 p-10 text-center">
          <p className="text-lg font-medium">Nothing to show yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-foreground/70">
            Save results from the tools and they appear here, grouped by the area you gave them.
            Or load some sample data to see how the dashboard looks.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleLoadDemo}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:opacity-90"
            >
              Load demo data
            </button>
            <Link href="/" className="text-sm font-medium text-accent hover:underline">
              Browse the tools →
            </Link>
          </div>
        </div>
      )}

      {ready && records.length > 0 && (
        <>
          <section aria-label="Key figures" className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi label="Records">
              <AnimatedNumber value={kpis.records} format={integer} />
            </Kpi>
            <Kpi label="Areas">
              <AnimatedNumber value={kpis.areas} format={integer} />
            </Kpi>
            <Kpi label="Latest OEE">
              {kpis.latestOee === null ? (
                "—"
              ) : (
                <AnimatedNumber value={kpis.latestOee} format={pct} />
              )}
            </Kpi>
            <Kpi label="Average 5S score">
              {kpis.averageFiveS === null ? (
                "—"
              ) : (
                <AnimatedNumber value={kpis.averageFiveS} format={(n) => pct(n, 0)} />
              )}
            </Kpi>
          </section>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel
              title="OEE over time"
              subtitle="Every saved OEE reading, one line per area."
              className="lg:col-span-2"
            >
              {series.length === 0 ? (
                <EmptyPanel tool="OEE" />
              ) : (
                <>
                  <OeeTrendChart series={series} />
                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    {series.map((s, i) => (
                      <li key={s.key} className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }}
                        />
                        <span>{s.area}</span>
                        <span className="tabular-nums text-foreground/60">
                          {pct(s.points[s.points.length - 1].oee)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Panel>

            <Panel
              title="Top defect causes"
              subtitle={
                pareto
                  ? `Latest Pareto of ${pareto.areas.join(", ")}, combined.`
                  : "Latest Pareto of each area, combined."
              }
            >
              {pareto === null ? (
                <EmptyPanel tool="Pareto" />
              ) : (
                <>
                  <p className="mb-3 text-sm">
                    <strong>
                      {pareto.result.vitalCount} of {pareto.result.rows.length}
                    </strong>{" "}
                    causes account for {pct(vitalShare)} of {pareto.result.total} defects.
                  </p>
                  <ParetoChart
                    rows={pareto.result.rows}
                    total={pareto.result.total}
                    threshold={PARETO_CUTOFF}
                  />
                </>
              )}
            </Panel>

            <Panel title="5S by area" subtitle="Latest audit of each area.">
              {fiveS.length === 0 ? (
                <EmptyPanel tool="5S" />
              ) : (
                <ul className="space-y-5">
                  {fiveS.map((s) => (
                    <li key={s.key}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium">{s.area}</span>
                        <span className="tabular-nums text-foreground/70">
                          {pct(s.percent, 0)} · {s.rating}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-foreground/10">
                        <div
                          className={`h-3 rounded-full transition-[width] duration-500 ease-out ${RATING_BAR[s.rating]}`}
                          style={{ width: `${s.percent * 100}%` }}
                        />
                      </div>
                      {s.weakest && (
                        <p className="mt-1 text-xs text-foreground/60">
                          Weakest: {s.weakest.name} ({pct(s.weakest.percent, 0)})
                          {s.answered < s.total && ` · ${s.answered} of ${s.total} rated`}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel
              title="Takt time by line"
              subtitle="Latest takt analysis of each area."
              className="lg:col-span-2"
            >
              {takt.length === 0 ? (
                <EmptyPanel tool="Takt" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-foreground/15 text-left text-foreground/60">
                        <th className="py-2 pr-3 font-medium">Area</th>
                        <th className="py-2 pr-3 text-right font-medium">Takt</th>
                        <th className="py-2 pr-3 font-medium">Bottleneck</th>
                        <th className="py-2 pr-3 text-right font-medium">Min. operators</th>
                        <th className="py-2 text-right font-medium">Stations over takt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {takt.map((t) => (
                        <tr key={t.key} className="border-b border-foreground/10">
                          <td className="py-2 pr-3 font-medium">{t.area}</td>
                          <td className="py-2 pr-3 text-right tabular-nums">
                            {t.taktTime.toFixed(1)} s
                          </td>
                          <td className="py-2 pr-3">
                            {t.bottleneck
                              ? `${t.bottleneck.name} (${t.bottleneck.cycleTime} s)`
                              : "—"}
                          </td>
                          <td className="py-2 pr-3 text-right tabular-nums">{t.minOperators}</td>
                          <td
                            className={`py-2 text-right tabular-nums ${
                              t.overTakt > 0 ? "font-medium text-red-500" : "text-foreground/60"
                            }`}
                          >
                            {t.overTakt === 0 ? "None" : t.overTakt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          </div>
        </>
      )}
    </main>
  );
}