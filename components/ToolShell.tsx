import type { ReactNode } from "react";

interface ToolShellProps {
  title: string;
  description: string;
  inputs: ReactNode;
  results: ReactNode;
  explainer: ReactNode;
}

export default function ToolShell({
  title,
  description,
  inputs,
  results,
  explainer,
}: ToolShellProps) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-2xl text-foreground/70">{description}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-foreground/15 p-5">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-foreground/60">
            Inputs
          </h2>
          {inputs}
        </section>

        <section className="rounded-xl border border-foreground/15 p-5">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-foreground/60">
            Results
          </h2>
          {results}
        </section>
      </div>

      <section className="mt-6 rounded-xl bg-foreground/5 p-5">
        <h2 className="mb-2 font-medium">About this tool</h2>
        <div className="space-y-2 text-sm text-foreground/80">{explainer}</div>
      </section>
    </main>
  );
}