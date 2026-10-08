"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonVariant } from "./button";

type SubmitButtonProps = {
  children: ReactNode;
  pendingText?: string;
  variant?: ButtonVariant;
  className?: string;
};

/** Submit button that disables itself while its parent form's action is running. */
export function SubmitButton({ children, pendingText = "Working…", variant, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} className={className} disabled={pending} aria-disabled={pending}>
      {pending ? pendingText : children}
    </Button>
  );
}
