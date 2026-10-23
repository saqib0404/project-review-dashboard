"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application rendering error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-5 text-center">
      <AlertTriangle className="size-12 text-amber-600" />

      <h1 className="text-2xl font-bold">Something went wrong</h1>

      <p className="max-w-md text-slate-600">
        We could not load this page. Please try again.
      </p>

      <Button onClick={reset}>
        <RefreshCw className="mr-2 size-4" />
        Try again
      </Button>
    </main>
  );
}
