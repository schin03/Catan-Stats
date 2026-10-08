import type { ComponentPropsWithoutRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger";

const base =
  "inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-base font-semibold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-forest text-card hover:bg-forest/90",
  secondary: "border border-border bg-card text-foreground hover:bg-border/40",
  danger: "bg-brick text-card hover:bg-brick/90",
};

type ButtonProps = ComponentPropsWithoutRef<"button"> & { variant?: ButtonVariant };

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
