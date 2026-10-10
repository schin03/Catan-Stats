"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getString, getUuid } from "@/lib/actions/form-data";
import type { FormState } from "@/lib/actions/form-state";
import { requireUser } from "@/lib/auth/require-user";
import { friendlyDbError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { validateDiceInput } from "@/lib/validation/dice";
import { isUuid } from "@/lib/validation/lobbies";

const BAD_REQUEST: FormState = {
  status: "error",
  message: "Something went wrong. Please refresh the page and try again.",
};
const OK: FormState = { status: "success" };

function revalidateGame(lobbyId: string, gameId: string) {
  revalidatePath(`/lobbies/${lobbyId}/games/${gameId}`);
}

export async function createGame(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const lobbyId = getUuid(formData, "lobbyId");
  if (!lobbyId) return BAD_REQUEST;

  const playerIds = [...new Set(formData.getAll("playerIds").map(String).filter(isUuid))];
  if (playerIds.length < 2 || playerIds.length > 4) {
    return { status: "error", message: "Choose 2 to 4 players." };
  }
  const players = playerIds.map((id) => ({
    user_id: id,
    color: getString(formData, `color:${id}`) || null,
  }));

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_game", { p_lobby_id: lobbyId, p_players: players });
  if (error || typeof data !== "string") {
    console.error("create_game failed:", error?.message);
    return { status: "error", message: friendlyDbError(error?.message) };
  }
  redirect(`/lobbies/${lobbyId}/games/${data}`);
}

export async function addRoll(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const lobbyId = getUuid(formData, "lobbyId");
  const gameId = getUuid(formData, "gameId");
  if (!lobbyId || !gameId) return BAD_REQUEST;

  const dice = validateDiceInput(
    getString(formData, "red"),
    getString(formData, "yellow"),
    getString(formData, "event"),
  );
  if (!dice.ok) return { status: "error", message: dice.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("add_roll", {
    p_game_id: gameId,
    p_red: dice.red,
    p_yellow: dice.yellow,
    p_event: dice.eventDie,
  });
  if (error) {
    console.error("add_roll failed:", error.message);
    return { status: "error", message: friendlyDbError(error.message) };
  }
  revalidateGame(lobbyId, gameId);
  return OK;
}

export async function updateRoll(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const lobbyId = getUuid(formData, "lobbyId");
  const gameId = getUuid(formData, "gameId");
  const rollId = getUuid(formData, "rollId");
  if (!lobbyId || !gameId || !rollId) return BAD_REQUEST;

  const dice = validateDiceInput(
    getString(formData, "red"),
    getString(formData, "yellow"),
    getString(formData, "event"),
  );
  if (!dice.ok) return { status: "error", message: dice.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_roll", {
    p_roll_id: rollId,
    p_red: dice.red,
    p_yellow: dice.yellow,
    p_event: dice.eventDie,
  });
  if (error) {
    console.error("update_roll failed:", error.message);
    return { status: "error", message: friendlyDbError(error.message) };
  }
  revalidateGame(lobbyId, gameId);
  return OK;
}

export async function deleteRoll(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const lobbyId = getUuid(formData, "lobbyId");
  const gameId = getUuid(formData, "gameId");
  const rollId = getUuid(formData, "rollId");
  if (!lobbyId || !gameId || !rollId) return BAD_REQUEST;

  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_roll", { p_roll_id: rollId });
  if (error) {
    console.error("delete_roll failed:", error.message);
    return { status: "error", message: friendlyDbError(error.message) };
  }
  revalidateGame(lobbyId, gameId);
  return OK;
}

export async function deleteGame(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const lobbyId = getUuid(formData, "lobbyId");
  const gameId = getUuid(formData, "gameId");
  if (!lobbyId || !gameId) return BAD_REQUEST;

  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_game", { p_game_id: gameId });
  if (error) {
    console.error("delete_game failed:", error.message);
    return { status: "error", message: friendlyDbError(error.message) };
  }
  redirect(`/lobbies/${lobbyId}/games`);
}
