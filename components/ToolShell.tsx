"use client";

import { useRef, useState, type ReactNode } from "react";
import { exportFilename, formatDate } from "@/lib/exportFilename";
import { exportNodeAsPng } from "@/lib/exportImage";

interface ToolShellProps {
  title: string;
  description: string;
  inputs: ReactNode;
  results: ReactNode;
  explainer: ReactNode;
  /** Full-width layout with results above inputs, for wide visuals like diagrams. */
  stacked?: boolean;
}

const nextPaint = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

export default function ToolShell({
  title,
  description,
  inputs,
  results,
  explainer,
  stacked = false,
}: ToolShellProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const handleExport = async () => {
    if (!exportRef.current || exporting) return;
    setExportError("");
    setExporting(true);
    try {
      await nextPaint(); // let the export header render before capturing
      await exportNodeAsPng(exportRef.current, exportFilename(title, new Date()));
    } catch {
      setExportError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-2xl text-foreground/70">{description}</p>
      </header>

      <div className={stacked ? "grid gap-6" : "grid items-start gap-6 lg:grid-cols-2"}>
        <section className="rounded-xl border border-foreground/15 p-5">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-foreground/60">
            Inputs
          </h2>
          {inputs}
        </section>

        <section
          className={`rounded-xl border border-foreground/15 p-5 ${
            stacked ? "order-first" : "lg:sticky lg:top-6"
          }`}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-foreground/60">
              Results
            </h2>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="rounded-lg border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5 disabled:opacity-50"
            >
              {exporting ? "Exporting…" : "Export PNG"}
            </button>
          </div>

          {/* The negative margin cancels the padding, so the layout is unchanged
              but the exported image gets some breathing room. */}
          <div ref={exportRef} className="-m-4 bg-background p-4">
            {exporting && (
              <p className="mb-4 text-sm font-medium text-foreground/70">
                {title} · Lean Toolkit · {formatDate(new Date())}
              </p>
            )}
            {results}
          </div>

          {exportError && <p className="mt-3 text-sm text-red-500">{exportError}</p>}
        </section>
      </div>

      <section className="mt-6 rounded-xl bg-foreground/5 p-5">
        <h2 className="mb-2 font-medium">About this tool</h2>
        <div className="space-y-2 text-sm text-foreground/80">{explainer}</div>
      </section>
    </main>
  );
}