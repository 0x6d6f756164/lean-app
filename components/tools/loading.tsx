export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="h-8 w-64 animate-pulse rounded bg-foreground/10" />
      <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-foreground/10" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="h-96 animate-pulse rounded-xl bg-foreground/5" />
        <div className="h-96 animate-pulse rounded-xl bg-foreground/5" />
      </div>
    </main>
  );
}