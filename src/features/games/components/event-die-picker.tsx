import type { EventDie } from "@/features/games/types";

// Visual colours for each face. Tailwind's JIT scanner won't see dynamic class names
// so we use inline styles for the background colours instead.
const FACES: { value: EventDie; label: string; bg: string; text: string }[] = [
  { value: "black",  label: "Black",  bg: "#3b3b3b", text: "#ffffff" },
  { value: "yellow", label: "Yellow", bg: "#f0e68c", text: "#3b2f25" },
  { value: "green",  label: "Green",  bg: "#8fbc8f", text: "#3b2f25" },
  { value: "grey",   label: "Grey",   bg: "#c0c0c0", text: "#3b2f25" },
];

type EventDiePickerProps = {
  value: EventDie | null;
  onChange: (value: EventDie | null) => void;
};

/**
 * Optional event die picker. Tapping an already-selected face deselects it,
 * because the event die is not required for every roll.
 */
export function EventDiePicker({ value, onChange }: EventDiePickerProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">
        Event die{" "}
        <span className="font-normal text-muted">(optional — tap to select, tap again to clear)</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {FACES.map((face) => {
          const selected = value === face.value;
          return (
            <label key={face.value} className="relative block">
              <input
                type="radio"
                name="event"
                value={face.value}
                checked={selected}
                onChange={() => onChange(face.value)}
                onClick={() => { if (selected) onChange(null); }}
                className="peer sr-only"
              />
              <span
                className="flex min-h-12 min-w-16 cursor-pointer items-center justify-center rounded-md border-2 border-transparent px-3 text-sm font-bold transition-all peer-checked:border-wheat peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sea"
                style={{ backgroundColor: face.bg, color: face.text }}
              >
                {face.label}
              </span>
            </label>
          );
        })}
      </div>
      {/* When the user clears the selection, we need an empty string value submitted. */}
      {value === null && <input type="hidden" name="event" value="" />}
    </fieldset>
  );
}

/** Small chip used in the roll history table. */
export function EventDieChip({ value }: { value: EventDie }) {
  const face = FACES.find((f) => f.value === value);
  if (!face) return null;
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: face.bg, color: face.text }}
    >
      {face.label}
    </span>
  );
}
