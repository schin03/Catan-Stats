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
  active_game_exists: "This lobby already has a game in progress.",
  invalid_players: "Choose the players for this game.",
  invalid_player_count: "A game needs 2 to 4 players.",
  duplicate_players: "Each player can only be chosen once.",
  duplicate_colors: "Two players can't have the same color.",
  player_not_in_lobby: "All players must be current lobby members.",
  invalid_dice: "Dice values must be whole numbers from 1 to 6.",
  roll_not_found: "That roll no longer exists. It may have been deleted.",
};

const GENERIC = "Something went wrong. Please try again.";

export function friendlyDbError(message: string | undefined): string {
  if (!message) return GENERIC;
  if (message in MESSAGES) return MESSAGES[message];
  // Raised by Postgres itself when a row-level security policy blocks a write.
  if (message.includes("row-level security")) return MESSAGES.not_authorized;
  return GENERIC;
}
