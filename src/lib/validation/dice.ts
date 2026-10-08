// Dice validation shared by the roll actions. The database enforces the same 1-6 rule
// (check constraint + function guard); this gives friendly messages first.

export const DIE_MIN = 1;
export const DIE_MAX = 6;

export function isValidDie(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= DIE_MIN && value <= DIE_MAX;
}

/** Parses a form value into a die face, or null if it isn't exactly one of 1-6. */
export function parseDie(raw: string): number | null {
  return /^[1-6]$/.test(raw) ? Number(raw) : null;
}

export type DiceInputResult = { ok: true; red: number; yellow: number } | { ok: false; error: string };

export function validateDiceInput(redRaw: string, yellowRaw: string): DiceInputResult {
  const red = parseDie(redRaw);
  const yellow = parseDie(yellowRaw);
  if (red === null && yellow === null) return { ok: false, error: "Choose a value for both dice." };
  if (red === null) return { ok: false, error: "Choose a value for the red die." };
  if (yellow === null) return { ok: false, error: "Choose a value for the yellow die." };
  return { ok: true, red, yellow };
}
