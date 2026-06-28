"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Crescendo Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <AlertTriangle className="mb-6 h-16 w-16 text-accent-coral" />
      <h2 className="font-display text-3xl font-bold text-white">
        Something went wrong
      </h2>
      <p className="mt-4 max-w-md text-center text-gray-400">
        An unexpected error occurred. Our team has been notified.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-medium text-white transition-all hover:bg-brand-600 hover:shadow-glow"
      >
        <RotateCcw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}
