import type { ReactNode } from "react";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brick" }) {
  const toneClass = tone === "brick" ? "border-brick text-brick" : "border-border text-muted";
  return <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${toneClass}`}>{children}</span>;
}
