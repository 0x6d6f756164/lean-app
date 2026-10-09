"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-3 text-foreground/70">
        An unexpected error occurred. Your saved records are not affected.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}