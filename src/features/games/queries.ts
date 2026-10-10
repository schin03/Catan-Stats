import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation/lobbies";
import type { ActiveGameSummary, EventDie, Game, GameDetail, GameStatus, Participant, Roll } from "./types";

type GameRow = {
  id: string; lobby_id: string; status: GameStatus;
  winner_id: string | null; created_at: string; completed_at: string | null;
};
type ParticipantRow = {
  user_id: string; color: string | null; score: number | null;
  profile: { username: string } | null;
};

const GAME_COLUMNS = "id, lobby_id, status, winner_id, created_at, completed_at";
const PARTICIPANT_SELECT = "user_id, color, score, profile:profiles!user_id(username)";

function toGame(row: GameRow): Game {
  return {
    id: row.id, lobbyId: row.lobby_id, status: row.status,
    winnerId: row.winner_id, createdAt: row.created_at, completedAt: row.completed_at,
  };
}
function toParticipants(rows: ParticipantRow[]): Participant[] {
  return rows.map((row) => ({
    userId: row.user_id,
    username: row.profile?.username ?? "Unknown",
    color: row.color,
    score: row.score,
  })).sort((a, b) => a.username.localeCompare(b.username, undefined, { sensitivity: "base" }));
}

export const getActiveGame = cache(async (lobbyId: string): Promise<ActiveGameSummary | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games").select(GAME_COLUMNS)
    .eq("lobby_id", lobbyId).eq("status", "active").maybeSingle();
  if (error) throw new Error(`Failed to load active game: ${error.message}`);
  if (!data) return null;
  const game = toGame(data as unknown as GameRow);

  const [participantsRes, countRes] = await Promise.all([
    supabase.from("game_participants").select(PARTICIPANT_SELECT).eq("game_id", game.id),
    supabase.from("dice_rolls").select("id", { count: "exact", head: true }).eq("game_id", game.id),
  ]);
  if (participantsRes.error) throw new Error(`Failed to load players: ${participantsRes.error.message}`);
  if (countRes.error) throw new Error(`Failed to count rolls: ${countRes.error.message}`);

  return {
    game,
    participants: toParticipants((participantsRes.data ?? []) as unknown as ParticipantRow[]),
    rollCount: countRes.count ?? 0,
  };
});

export const getGame = cache(async (lobbyId: string, gameId: string): Promise<GameDetail | null> => {
  if (!isUuid(gameId)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games").select(GAME_COLUMNS)
    .eq("id", gameId).eq("lobby_id", lobbyId).maybeSingle();
  if (error) throw new Error(`Failed to load game: ${error.message}`);
  if (!data) return null;

  const [participantsRes, rollsRes] = await Promise.all([
    supabase.from("game_participants").select(PARTICIPANT_SELECT).eq("game_id", gameId),
    supabase.from("dice_rolls")
      .select("id, round_number, red, yellow, total, event_die")
      .eq("game_id", gameId).order("round_number", { ascending: true }),
  ]);
  if (participantsRes.error) throw new Error(`Failed to load players: ${participantsRes.error.message}`);
  if (rollsRes.error) throw new Error(`Failed to load rolls: ${rollsRes.error.message}`);

  const rolls: Roll[] = ((rollsRes.data ?? []) as {
    id: string; round_number: number; red: number; yellow: number;
    total: number; event_die: string | null;
  }[]).map((row) => ({
    id: row.id, round: row.round_number, red: row.red, yellow: row.yellow,
    total: row.total, eventDie: (row.event_die as EventDie | null),
  }));

  return {
    ...toGame(data as unknown as GameRow),
    participants: toParticipants((participantsRes.data ?? []) as unknown as ParticipantRow[]),
    rolls,
  };
});
