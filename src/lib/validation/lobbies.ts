// Pure validation helpers for lobby-related input. The database enforces the same
// limits; these exist to give friendly messages before a round trip.

export const LOBBY_NAME_MAX = 50;
export const LABEL_NAME_MAX = 30;
export const INVITE_CODE_LENGTH = 6;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INVITE_CODE_PATTERN = /^[A-Za-z0-9]{6}$/;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/** Callers pass an already-trimmed string. Returns an error message or null. */
export function validateLobbyName(name: string): string | null {
  if (name.length === 0) return "Enter a lobby name.";
  if (name.length > LOBBY_NAME_MAX) return `Lobby names can be at most ${LOBBY_NAME_MAX} characters.`;
  return null;
}

export function validateLabelName(name: string): string | null {
  if (name.length === 0) return "Enter a label name.";
  if (name.length > LABEL_NAME_MAX) return `Labels can be at most ${LABEL_NAME_MAX} characters.`;
  return null;
}

/** Format check only. Whether the code is real and unexpired is decided by the database. */
export function validateInviteCode(code: string): string | null {
  return INVITE_CODE_PATTERN.test(code) ? null : `Invite codes are ${INVITE_CODE_LENGTH} letters and numbers.`;
}
