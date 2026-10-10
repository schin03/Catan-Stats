import { EVENT_DIE_VALUES, type EventDie } from "@/features/games/types";

export const DIE_MIN = 1;
export const DIE_MAX = 6;

export function isValidDie(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= DIE_MIN && value <= DIE_MAX;
}

export function parseDie(raw: string): number | null {
  return /^[1-6]$/.test(raw) ? Number(raw) : null;
}

export function parseEventDie(raw: string): EventDie | null {
  return (EVENT_DIE_VALUES as readonly string[]).includes(raw) ? (raw as EventDie) : null;
}

export type DiceInputResult =
  | { ok: true; red: number; yellow: number; eventDie: EventDie | null }
  | { ok: false; error: string };

export function validateDiceInput(
  redRaw: string,
  yellowRaw: string,
  eventRaw: string,
): DiceInputResult {
  const red = parseDie(redRaw);
  const yellow = parseDie(yellowRaw);
  if (red === null && yellow === null) return { ok: false, error: "Choose a value for both dice." };
  if (red === null) return { ok: false, error: "Choose a value for the red die." };
  if (yellow === null) return { ok: false, error: "Choose a value for the yellow die." };
  // eventRaw is "" when the host skips the event die, which is valid.
  const eventDie = eventRaw === "" ? null : parseEventDie(eventRaw);
  if (eventRaw !== "" && eventDie === null) return { ok: false, error: "Invalid event die value." };
  return { ok: true, red, yellow, eventDie };
}
