"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ClientDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Client detail error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h2 className="text-lg font-semibold">This page couldn&apos;t load</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || "A server error occurred. Reload to try again."}
      </p>
      <Button onClick={reset}>Reload</Button>
    </div>
  );
}
