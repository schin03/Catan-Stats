"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/**
 * Modal built on the native <dialog> element, which gives us a focus trap, Escape to
 * close, an inert background, and focus return to the opening button for free.
 * Clicking the dimmed backdrop also closes it.
 */
export function Dialog({ open, onClose, title, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      // m-auto: Tailwind's reset removes the browser's default centering margin.
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-border bg-card p-0 text-foreground shadow-lg backdrop:bg-foreground/50"
    >
      <div className="space-y-4 p-5">
        <h2 id={titleId} className="font-serif text-xl font-semibold">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
