"use client";

import { useRef, useState, type ReactNode } from "react";
import { useSharedArea } from "@/hooks/useSharedState";
import { exportFilename, formatDate } from "@/lib/exportFilename";
import { exportNodeAsPng } from "@/lib/exportImage";
import { normalizeArea } from "@/lib/lean/area";
import { shareHash } from "@/lib/share/codec";
import type { ToolId } from "@/types/lean";

interface ToolShellProps {
  title: string;
  description: string;
  inputs: ReactNode;
  results: ReactNode;
  explainer: ReactNode;
  /** Full-width layout with results above inputs, for wide visuals like diagrams. */
  stacked?: boolean;
  /** Enables the "Area / line" field and the "Copy link" button for this tool. */
  share?: { tool: ToolId; data: unknown };
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
  share,
}: ToolShellProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  const sharedArea = useSharedArea(share?.tool);
  const [area, setArea] = useState(sharedArea);
  const cleanArea = normalizeArea(area);

  const handleExport = async () => {
    if (!exportRef.current || exporting) return;
    setExportError("");
    setExporting(true);
    try {
      await nextPaint(); // let the export header and light theme render before capturing
      await exportNodeAsPng(exportRef.current, exportFilename(title, new Date(), cleanArea));
    } catch {
      setExportError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!share) return;
    try {
      const hash = shareHash(share.tool, share.data, cleanArea);
      const url = `${window.location.origin}${window.location.pathname}${hash}`;
      await navigator.clipboard.writeText(url);
      setShareMessage("Link copied");
    } catch (e) {
      setShareMessage(
        e instanceof RangeError ? "Too much data to fit in a link" : "Couldn't copy the link",
      );
    }
    window.setTimeout(() => setShareMessage(""), 3000);
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

          {share && (
            <label className="mb-5 block">
              <span className="mb-1 block text-sm">
                Area / line <span className="text-foreground/50">(optional)</span>
              </span>
              <input
                value={area}
                maxLength={60}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Packing line 2"
                className="w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2"
              />
            </label>
          )}

          {inputs}
        </section>

        <section
          className={`rounded-xl border border-foreground/15 p-5 ${
            stacked ? "order-first" : "lg:sticky lg:top-6"
          }`}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-foreground/60">
              Results
            </h2>
            <div className="flex items-center gap-2">
              <span role="status" className="text-xs text-foreground/60">
                {shareMessage}
              </span>
              {share && (
                <button
                  type="button"
                  onClick={handleShare}
                  className="rounded-lg border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
                >
                  Copy link
                </button>
              )}
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="rounded-lg border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5 disabled:opacity-50"
              >
                {exporting ? "Exporting…" : "Export PNG"}
              </button>
            </div>
          </div>

          {/* The negative margin cancels the padding, so the layout is unchanged
              but the exported image gets some breathing room. */}
          <div
            ref={exportRef}
            className={`-m-4 p-4 ${exporting ? "export-light" : "bg-background"}`}
          >
            {exporting && (
              <p className="mb-4 text-sm font-medium text-foreground/70">
                {[title, cleanArea, "Lean Toolkit", formatDate(new Date())]
                  .filter(Boolean)
                  .join(" · ")}
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