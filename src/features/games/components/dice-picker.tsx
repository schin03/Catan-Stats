"use client";

type Die = "red" | "yellow";

type DicePickerProps = {
  red: number | null;
  yellow: number | null;
  onChange: (die: Die, value: number) => void;
};

const FACES = [1, 2, 3, 4, 5, 6] as const;

function DieGroup({
  die,
  legend,
  value,
  onChange,
}: {
  die: Die;
  legend: string;
  value: number | null;
  onChange: (die: Die, value: number) => void;
}) {
  const checkedColors =
    die === "red" ? "peer-checked:bg-brick peer-checked:text-card" : "peer-checked:bg-wheat peer-checked:text-foreground";

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className="grid grid-cols-6 gap-2">
        {FACES.map((face) => (
          <label key={face} className="relative block">
            {/* Native radios: arrow keys move between faces, and screen readers announce them. */}
            <input
              type="radio"
              name={die}
              value={face}
              checked={value === face}
              onChange={() => onChange(die, face)}
              className="peer sr-only"
            />
            <span
              className={`flex min-h-12 cursor-pointer items-center justify-center rounded-md border-2 border-border bg-card text-xl font-bold peer-checked:border-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sea ${checkedColors}`}
            >
              {face}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Two rows of big tap targets, one per die. Used for adding and editing rolls. */
export function DicePicker({ red, yellow, onChange }: DicePickerProps) {
  return (
    <div className="space-y-4">
      <DieGroup die="red" legend="Red die" value={red} onChange={onChange} />
      <DieGroup die="yellow" legend="Yellow die" value={yellow} onChange={onChange} />
    </div>
  );
}
