import type { ComponentPropsWithoutRef } from "react";

/** Paper-style panel. The `.paper` texture class lives in globals.css. */
export function Card({ className = "", ...props }: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={`paper rounded-lg border border-border bg-card p-5 shadow-sm ${className}`}
      {...props}
    />
  );
}
