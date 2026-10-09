"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { ExportingProvider } from "@/components/ExportContext";
import { useSharedArea } from "@/hooks/useSharedState";
import { exportFilename, formatDate } from "@/lib/exportFilename";
import { exportNodeAsPng } from "@/lib/exportImage";
import {
  EXPORT_BACKGROUND,
  EXPORT_THEMES,
  exportThemeClass,
  type ExportTheme,
} from "@/lib/exportTheme";
import { normalizeArea } from "@/lib/lean/area";
import { shareHash } from "@/lib/share/codec";
import { SITE } from "@/lib/site";
import { createRecord } from "@/lib/workspace/records";
import { saveRecord } from "@/lib/workspace/store";
import type { ToolId } from "@/types/lean";

interface ToolShellProps {
  title: string;
  description: string;
  inputs: ReactNode;
  results: ReactNode;
  explainer: ReactNode;
  /** Full-width layout with results above inputs, for wide visuals like diagrams. */
  stacked?: boolean;
  /** Enables the "Area / line" field, Save and Copy link for this tool. */
  share?: { tool: ToolId; data: unknown };
}

const BUTTON =
  "rounded-lg border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5";

const PHONE_QUERY = "(max-width: 639px)";
const PHONE_EXPORT_WIDTH = 800;

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
  const [exportWidth, setExportWidth] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exportTheme, setExportTheme] = useState<ExportTheme>("light");
  const [message, setMessage] = useState("");

  const sharedArea = useSharedArea(share?.tool);
  const [area, setArea] = useState(sharedArea);
  const cleanArea = normalizeArea(area);

  const exportState = useMemo(
    () => ({ exporting, theme: exportTheme }),
    [exporting, exportTheme],
  );

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3000);
  };

  const handleExport = async () => {
    const node = exportRef.current;
    if (!node || exporting) return;
    setExportError("");
    // On phones, lay the results out at a fixed width so the image stays readable.
    setExportWidth(window.matchMedia(PHONE_QUERY).matches ? PHONE_EXPORT_WIDTH : null);
    setExporting(true);
    try {
      await nextPaint(); // let the export header, theme and width render before capturing
      await exportNodeAsPng(
        node,
        exportFilename(title, new Date(), cleanArea),
        EXPORT_BACKGROUND[exportTheme],
      );
    } catch {
      setExportError("Export failed. Please try again.");
    } finally {
      setExporting(false);
      setExportWidth(null);
    }
  };

  const handleShare = async () => {
    if (!share) return;
    try {
      const hash = shareHash(share.tool, share.data, cleanArea);
      const url = `${window.location.origin}${window.location.pathname}${hash}`;
      await navigator.clipboard.writeText(url);
      flash("Link copied");
    } catch (e) {
      flash(e instanceof RangeError ? "Too much data to fit in a link" : "Couldn't copy the link");
    }
  };

  const handleSave = () => {
    if (!share) return;
    const saved = saveRecord(createRecord(share.tool, share.data, cleanArea));
    flash(saved ? "Saved to your workspace" : "Couldn't save: browser storage is unavailable");
  };

  return (
    <main className="mx-auto max-w-6xl animate-fade-up px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-2xl text-foreground/70">{description}</p>
      </header>

      <div
        className={
          stacked ? "grid grid-cols-1 gap-6" : "grid grid-cols-1 items-start gap-6 lg:grid-cols-2"
        }
      >
        <section className="min-w-0 rounded-2xl border border-foreground/10 bg-surface p-6 shadow-sm">
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
          className={`min-w-0 rounded-2xl border border-foreground/10 bg-surface p-6 shadow-sm ${
            stacked ? "order-first" : "lg:sticky lg:top-[calc(var(--header-height)_+_1.5rem)]"
          }`}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-foreground/60">
              Results
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span
                key={message}
                role="status"
                className={`text-xs text-foreground/60 ${message ? "animate-pop" : ""}`}
              >
                {message}
              </span>
              {share && (
                <>
                  <button type="button" onClick={handleSave} className={BUTTON}>
                    Save
                  </button>
                  <button type="button" onClick={handleShare} className={BUTTON}>
                    Copy link
                  </button>
                </>
              )}
              <div
                role="group"
                aria-label="Export theme"
                title="Theme of the exported image"
                className="flex rounded-lg border border-foreground/20 p-0.5 text-xs"
              >
                {EXPORT_THEMES.map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    aria-pressed={exportTheme === theme}
                    onClick={() => setExportTheme(theme)}
                    className={`rounded-md px-2 py-1 capitalize ${
                      exportTheme === theme
                        ? "bg-foreground/10 font-medium"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className={`${BUTTON} disabled:opacity-50`}
              >
                {exporting ? "Exporting…" : "Export PNG"}
              </button>
            </div>
          </div>

          {/* The outer wrapper cancels the section padding. It isn't captured, so its
              negative margin can't shift the exported image. */}
          <div className="-m-4">
            <div
              ref={exportRef}
              style={exportWidth ? { width: exportWidth } : undefined}
              className={exporting ? `${exportThemeClass(exportTheme)} p-8` : "p-4"}
            >
              {exporting && (
                <p className="mb-6 text-sm font-medium text-foreground/70">
                  {[title, cleanArea, SITE.name, formatDate(new Date())]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              <ExportingProvider value={exportState}>{results}</ExportingProvider>
            </div>
          </div>

          {exportError && <p className="mt-3 text-sm text-red-500">{exportError}</p>}
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6">
        <h2 className="mb-2 font-medium">About this tool</h2>
        <div className="space-y-2 text-sm text-foreground/80">{explainer}</div>
      </section>
    </main>
  );
}