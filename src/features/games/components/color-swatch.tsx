// Catan player colors. Unknown or free-text colors fall back to an empty ring.
const COLORS: Record<string, string> = {
  red: "#c0392b",
  blue: "#2e6fb5",
  orange: "#e0802b",
  white: "#f7f3e8",
  green: "#3f8f4a",
  brown: "#7a5230",
};

export const CATAN_COLORS = Object.keys(COLORS);

export function ColorSwatch({ color }: { color: string | null }) {
  if (!color) return null;
  const hex = COLORS[color.toLowerCase()];
  return (
    <span
      aria-hidden="true"
      className="inline-block size-3.5 rounded-full border border-foreground/40"
      style={{ backgroundColor: hex ?? "transparent" }}
    />
  );
}
