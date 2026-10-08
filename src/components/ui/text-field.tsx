import { useId, type ComponentPropsWithoutRef } from "react";

type TextFieldProps = Omit<ComponentPropsWithoutRef<"input">, "id"> & {
  label: string;
  hint?: string;
  error?: string;
};

/** Labelled input wired up for screen readers: label, hint, and error are all announced. */
export function TextField({ label, hint, error, className = "", ...inputProps }: TextFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        // text-base (16px) stops iOS Safari from zooming in when the field is focused.
        className={`w-full rounded-md border bg-white/70 px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sea ${
          error ? "border-brick" : "border-border"
        } ${className}`}
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-brick">
          {error}
        </p>
      )}
    </div>
  );
}
