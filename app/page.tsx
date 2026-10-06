import Link from "next/link";
import { TOOLS } from "@/lib/tools";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <section className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">Lean Toolkit</h1>
        <p className="mt-4 text-lg text-foreground/70">
          Calculators and charts for Lean and industrial engineering. Enter your numbers,
          see the result instantly, and learn what it means.
        </p>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) =>
          t.ready ? (
            <Link
              key={t.id}
              href={t.href}
              className="rounded-xl border border-foreground/15 p-5 transition hover:border-foreground/40 hover:bg-foreground/5"
            >
              <h2 className="font-medium">{t.name}</h2>
              <p className="mt-2 text-sm text-foreground/70">{t.tagline}</p>
            </Link>
          ) : (
            <div
              key={t.id}
              className="rounded-xl border border-dashed border-foreground/15 p-5 opacity-60"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{t.name}</h2>
                <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs">Soon</span>
              </div>
              <p className="mt-2 text-sm text-foreground/70">{t.tagline}</p>
            </div>
          ),
        )}
      </section>
    </main>
  );
}