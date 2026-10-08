// Maps the short error codes raised by our database functions (see supabase/migrations)
// to messages safe to show people. Unknown errors get a generic message so internal
// details never leak to the browser.

const MESSAGES: Record<string, string> = {
  not_authorized: "Only the lobby host can do that.",
  not_authenticated: "Please log in again.",
  invalid_name: "Lobby names must be 1–50 characters.",
  host_cannot_leave: "The host can't leave. Delete the lobby instead.",
  cannot_remove_host: "The host can't be removed.",
  not_a_member: "You're not a member of that lobby.",
  code_generation_failed: "Couldn't generate a code. Please try again.",
};

const GENERIC = "Something went wrong. Please try again.";

export function friendlyDbError(message: string | undefined): string {
  if (!message) return GENERIC;
  if (message in MESSAGES) return MESSAGES[message];
  // Raised by Postgres itself when a row-level security policy blocks a write.
  if (message.includes("row-level security")) return MESSAGES.not_authorized;
  return GENERIC;
}
