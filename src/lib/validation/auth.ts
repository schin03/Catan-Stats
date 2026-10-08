// Pure validation helpers shared by the signup, login, and settings actions.
// The database enforces the username rules too; these give friendly messages first.

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const PASSWORD_MIN_LENGTH = 8;
// bcrypt (used by Supabase Auth) only considers the first 72 bytes of a password.
export const PASSWORD_MAX_BYTES = 72;

const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/;

/** Returns an error message, or null when the username is valid. */
export function validateUsername(username: string): string | null {
  if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
    return `Username must be ${USERNAME_MIN_LENGTH}–${USERNAME_MAX_LENGTH} characters.`;
  }
  if (!USERNAME_PATTERN.test(username)) {
    return "Use only letters, numbers, and underscores.";
  }
  return null;
}

/** Returns an error message, or null when the password is acceptable. */
export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) {
    return `Password must be at most ${PASSWORD_MAX_BYTES} characters.`;
  }
  return null;
}

export function validatePasswordConfirmation(password: string, confirmation: string): string | null {
  return password === confirmation ? null : "Passwords don't match.";
}
