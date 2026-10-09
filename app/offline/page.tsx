import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };

export default function OfflinePage() {
  return (
    <main className="mx-auto max-w-2xl animate-fade-up px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">You're offline</h1>
      <p className="mt-3 text-foreground/70">
        Pages you've already opened still work. Reconnect to open the others.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:opacity-90"
      >
        Back to the toolkit
      </Link>
    </main>
  );
}