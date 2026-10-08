"use server";

import { revalidatePath } from "next/cache";
import { getUuid } from "@/lib/actions/form-data";
import type { FormState } from "@/lib/actions/form-state";
import { requireUser } from "@/lib/auth/require-user";
import { friendlyDbError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation/lobbies";

const BAD_REQUEST: FormState = {
  status: "error",
  message: "Something went wrong. Please refresh the page and try again.",
};

/** Validates and parses the score+winner form, then calls finish_game or edit_completed_game. */
async function submitGameResults(
  formData: FormData,
  rpcName: "finish_game" | "edit_completed_game",
): Promise<FormState> {
  await requireUser();
  const lobbyId = getUuid(formData, "lobbyId");
  const gameId = getUuid(formData, "gameId");
  if (!lobbyId || !gameId) return BAD_REQUEST;

  const winnerId = getUuid(formData, "winnerId");
  if (!winnerId) return { status: "error", message: "Select a winner." };

  // Collect scores. The form sends one hidden playerIds field per participant, and one
  // score:<userId> field. Both must be present for every participant.
  const playerIds = formData.getAll("playerIds").map(String).filter(isUuid);
  if (playerIds.length === 0) return BAD_REQUEST;

  const fieldErrors: Record<string, string> = {};
  const scores: { user_id: string; score: number }[] = [];

  for (const userId of playerIds) {
    const raw = formData.get(`score:${userId}`)?.toString().trim() ?? "";
    const parsed = parseInt(raw, 10);
    if (!/^\d{1,2}$/.test(raw) || isNaN(parsed) || parsed < 0 || parsed > 99) {
      fieldErrors[`score:${userId}`] = "Enter a whole number from 0 to 99.";
    } else {
      scores.push({ user_id: userId, score: parsed });
    }
  }

  if (!playerIds.includes(winnerId)) {
    fieldErrors.winnerId = "The winner must be one of the players in this game.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc(rpcName, {
    p_game_id: gameId,
    p_scores: scores,
    p_winner_id: winnerId,
  });

  if (error) {
    console.error(`${rpcName} failed:`, error.message);
    return { status: "error", message: friendlyDbError(error.message) };
  }

  revalidatePath(`/lobbies/${lobbyId}/games`);
  revalidatePath(`/lobbies/${lobbyId}/games/${gameId}`);
  revalidatePath(`/lobbies/${lobbyId}/leaderboard`);
  revalidatePath(`/lobbies/${lobbyId}`);
  return { status: "success" };
}

export async function finishGame(_prev: FormState, formData: FormData): Promise<FormState> {
  return submitGameResults(formData, "finish_game");
}

export async function editCompletedGame(_prev: FormState, formData: FormData): Promise<FormState> {
  return submitGameResults(formData, "edit_completed_game");
}
