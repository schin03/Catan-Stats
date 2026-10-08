"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonVariant } from "./button";

type SubmitButtonProps = {
  children: ReactNode;
  pendingText?: string;
  variant?: ButtonVariant;
  className?: string;
  /** Extra reason to disable (e.g. form incomplete). It is always disabled while submitting. */
  disabled?: boolean;
};

/** Submit button that disables itself while its parent form's action is running. */
export function SubmitButton({
  children,
  pendingText = "Working…",
  variant,
  className,
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;
  return (
    <Button type="submit" variant={variant} className={className} disabled={isDisabled} aria-disabled={isDisabled}>
      {pending ? pendingText : children}
    </Button>
  );
}
