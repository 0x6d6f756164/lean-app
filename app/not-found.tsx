import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl animate-fade-up px-4 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-accent">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-foreground/70">That page doesn't exist, or it has moved.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:opacity-90"
      >
        Back to the tools
      </Link>
    </main>
  );
}