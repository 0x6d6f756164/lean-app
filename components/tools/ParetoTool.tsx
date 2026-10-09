"use client";

import { useMemo, useState } from "react";
import NumberField from "@/components/NumberField";
import ParetoChart from "@/components/ParetoChart";
import ToolShell from "@/components/ToolShell";
import { buildPareto, parseParetoText, type ParetoItem } from "@/lib/lean/pareto";

import { useSharedState } from "@/hooks/useSharedState";
import { DEFAULT_PARETO, parseParetoState, type ParetoState } from "@/lib/share/states";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default function ParetoTool() {
  const { shared, hash } = useSharedState("pareto", parseParetoState);
  return <ParetoForm key={shared ? hash : "default"} initial={shared ?? DEFAULT_PARETO} />;
}

function ParetoForm({ initial }: { initial: ParetoState }) {
  const [items, setItems] = useState<ParetoItem[]>(initial.items);
  const [cutoff, setCutoff] = useState(initial.cutoff);
  const [pasteText, setPasteText] = useState("");
  const [pasteMessage, setPasteMessage] = useState("");

  const result = useMemo(() => {
    try {
      return { ok: true as const, data: buildPareto(items, cutoff / 100) };
    } catch (e) {
      return { ok: false as const, message: e instanceof Error ? e.message : "Invalid input" };
    }
  }, [items, cutoff]);

  const updateItem = (i: number, patch: Partial<ParetoItem>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const addItem = () => setItems((prev) => [...prev, { label: "", count: 0 }]);
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const importPasted = () => {
    const parsed = parseParetoText(pasteText);
    if (parsed.length === 0) {
      setPasteMessage("No valid lines found. Use one \"category, count\" per line.");
      return;
    }
    setItems(parsed);
    setPasteText("");
    setPasteMessage(`Imported ${parsed.length} categories.`);
  };

  const inputs = (
    <div className="space-y-5">
      <NumberField label="Vital few cutoff" unit="%" value={cutoff} onChange={setCutoff} min={1} />

      <div>
        <h3 className="mb-2 text-sm font-medium">Categories and counts</h3>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="flex gap-2 animate-item-in">
              <input
                value={it.label}
                placeholder="Category"
                onChange={(e) => updateItem(i, { label: e.target.value })}
                className="w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2"
                aria-label={`Category ${i + 1} name`}
              />
              <input
                type="number"
                min={0}
                value={it.count}
                onChange={(e) => updateItem(i, { count: e.target.valueAsNumber || 0 })}
                className="w-28 rounded-lg border border-foreground/20 bg-transparent px-3 py-2"
                aria-label={`Category ${i + 1} count`}
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="rounded-lg px-3 text-foreground/60 hover:bg-foreground/10"
                aria-label={`Remove category ${i + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-3 rounded-lg border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
        >
          + Add category
        </button>
      </div>

      <details className="rounded-lg border border-foreground/15 p-3">
        <summary className="cursor-pointer text-sm font-medium">Paste from Excel or CSV</summary>
        <p className="mt-2 text-xs text-foreground/60">
          One category per line: name, then count (separated by a comma, tab or semicolon).
          This replaces the current list.
        </p>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          rows={5}
          className="mt-2 w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2 font-mono text-sm"
          placeholder={"Scratches, 45\nDents, 25"}
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={importPasted}
            className="rounded-lg border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
          >
            Import
          </button>
          {pasteMessage && <span className="text-xs text-foreground/60">{pasteMessage}</span>}
        </div>
      </details>
    </div>
  );

  let results;
  if (!result.ok) {
    results = <p className="text-red-500">{result.message}</p>;
  } else if (result.data.rows.length === 0) {
    results = (
      <p className="text-foreground/70">Add at least one category with a count above 0.</p>
    );
  } else {
    const { rows, total, vitalCount } = result.data;
    const vitalShare = rows[vitalCount - 1].cumulativePercent;

    results = (
      <div className="space-y-6">
        <div>
          <div className="text-5xl font-semibold tabular-nums">
            {vitalCount} of {rows.length}
          </div>
          <div className="text-sm text-foreground/60">
            categories account for {pct(vitalShare)} of the {total} total. Focus there first.
          </div>
        </div>

        <ParetoChart rows={rows} total={total} threshold={cutoff / 100} />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-foreground/15 text-left text-foreground/60">
                <th className="py-2 pr-3 font-medium">#</th>
                <th className="py-2 pr-3 font-medium">Category</th>
                <th className="py-2 pr-3 text-right font-medium">Count</th>
                <th className="py-2 pr-3 text-right font-medium">Share</th>
                <th className="py-2 text-right font-medium">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.label}
                  className={`border-b border-foreground/10 ${r.vital ? "font-medium" : "text-foreground/60"}`}
                >
                  <td className="py-2 pr-3 tabular-nums">{i + 1}</td>
                  <td className="py-2 pr-3">{r.label}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{r.count}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{pct(r.percent)}</td>
                  <td className="py-2 text-right tabular-nums">{pct(r.cumulativePercent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <ToolShell
      title="Pareto Chart Builder"
      description="Rank defect causes by frequency and find the vital few that drive most of your problems."
      inputs={inputs}
      results={results}
      share={{ tool: "pareto", data: { items, cutoff } }}
      explainer={
        <>
          <p>
            The <strong>Pareto principle</strong> says a small number of causes usually produce
            most of the effects. The bars show the count per category, sorted from largest to
            smallest. The line shows the running total as a percentage.
          </p>
          <p>
            Blue bars are the "vital few" that bring you up to the cutoff (80% by default). Fix
            those first and you remove most of the problem with the least effort. Categories are
            sorted and merged automatically, so you can enter them in any order.
          </p>
        </>
      }
    />
  );
}