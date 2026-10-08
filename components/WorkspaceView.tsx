"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
import { useRecords } from "@/hooks/useRecords";
import { formatDate } from "@/lib/exportFilename";
import { shareHash } from "@/lib/share/codec";
import { TOOLS } from "@/lib/tools";
import { parseRecords } from "@/lib/workspace/records";
import { clearRecords, deleteRecord, importRecords } from "@/lib/workspace/store";
import { summarizeRecord } from "@/lib/workspace/summary";
import type { LeanRecord } from "@/types/lean";

const MAX_IMPORT_BYTES = 2000000;
const dateTime = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });
const buttonClass =
  "rounded-lg border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5";

const toolName = (id: string) => TOOLS.find((t) => t.id === id)?.name ?? id;

function openHref(record: LeanRecord): string {
  const tool = TOOLS.find((t) => t.id === record.tool);
  if (!tool) return "/";
  try {
    return `${tool.href}${shareHash(record.tool, record.values, record.area)}`;
  } catch {
    return tool.href; // too large for a link: open the tool with its defaults
  }
}

function downloadJson(records: LeanRecord[]) {
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `lean-toolkit-records-${formatDate(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function WorkspaceView() {
  const { records, ready } = useRecords();
  const [message, setMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allows choosing the same file again
    if (!file) return;

    if (file.size > MAX_IMPORT_BYTES) {
      setMessage("That file is too large to import.");
      return;
    }
    const incoming = parseRecords(await file.text());
    if (incoming.length === 0) {
      setMessage("No valid records found in that file.");
      return;
    }
    const added = importRecords(incoming);
    setMessage(added === 1 ? "Imported 1 new record." : `Imported ${added} new records.`);
  };

  const handleClear = () => {
    if (window.confirm("Delete all saved records? This can't be undone.")) clearRecords();
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Workspace</h1>
        <p className="mt-2 max-w-2xl text-foreground/70">
          Results you saved from the tools. They are stored in this browser only, so export them
          to keep a backup or to move them to another device.
        </p>
      </header>

      {ready && (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={buttonClass}
              disabled={records.length === 0}
              onClick={() => downloadJson(records)}
            >
              Export JSON
            </button>
            <button type="button" className={buttonClass} onClick={() => fileInput.current?.click()}>
              Import JSON
            </button>
            <button
              type="button"
              className={buttonClass}
              disabled={records.length === 0}
              onClick={handleClear}
            >
              Clear all
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImport}
              aria-label="Import records from a JSON file"
            />
            <span role="status" className="text-sm text-foreground/60">
              {message}
            </span>
          </div>

          {records.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-foreground/20 p-8 text-center">
              <p className="font-medium">Nothing saved yet</p>
              <p className="mt-1 text-sm text-foreground/70">
                Use the Save button in any tool to keep a result here.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
              >
                Browse the tools →
              </Link>
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-foreground/10 rounded-2xl border border-foreground/10 bg-surface">
              {records.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-medium">{toolName(r.tool)}</span>
                      {r.area && <span className="text-sm text-foreground/70">{r.area}</span>}
                      <time dateTime={r.date} className="text-xs text-foreground/50">
                        {dateTime.format(new Date(r.date))}
                      </time>
                    </div>
                    <p className="mt-1 text-sm text-foreground/80">{summarizeRecord(r)}</p>
                  </div>
                  <div className="flex gap-2">
                    {/* A plain link on purpose: a full navigation makes the tool read the link's data. */}
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a href={openHref(r)} className={buttonClass}>
                      Open
                    </a>
                    <button type="button" className={buttonClass} onClick={() => deleteRecord(r.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}