import HeroTitle from "@/components/fx/HeroTitle";
import Reveal from "@/components/fx/Reveal";
import SpotlightLink from "@/components/fx/SpotlightLink";
import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/tools";

export default function Home() {
  const tools = TOOLS.filter((t) => t.ready);

  return (
    <div className="relative isolate">
      <div
        aria-hidden="true"
        className="hero-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px]"
      />

      <main className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <section className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            {SITE.eyebrow}
          </p>
          <div className="mt-3">
            <HeroTitle text={SITE.tagline} />
          </div>
          <p className="mt-5 max-w-2xl text-lg text-foreground/70">{SITE.intro}</p>
        </section>

        <section aria-label="Tools" className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t, i) => (
            <Reveal key={t.id} delay={i * 80} className="h-full">
              <SpotlightLink
                href={t.href}
                className="block h-full rounded-2xl border border-foreground/10 bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-sm font-semibold text-accent">
                  {i + 1}
                </span>
                <h2 className="mt-4 font-semibold">{t.name}</h2>
                <p className="mt-2 text-sm text-foreground/70">{t.tagline}</p>
                <span className="mt-4 inline-block text-sm font-medium text-accent">
                  Open tool{" "}
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </SpotlightLink>
            </Reveal>
          ))}
        </section>
      </main>
    </div>
  );
}