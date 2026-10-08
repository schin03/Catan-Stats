"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <Card role="alert" className="mx-auto max-w-md space-y-3 text-center">
      <h1 className="font-serif text-xl font-semibold">Something went wrong</h1>
      <p className="text-muted">We couldn&apos;t load this page. Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </Card>
  );
}
