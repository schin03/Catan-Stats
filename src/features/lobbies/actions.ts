"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getString, getUuid } from "@/lib/actions/form-data";
import type { FormState } from "@/lib/actions/form-state";
import { requireUser } from "@/lib/auth/require-user";
import { friendlyDbError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import {
  isUuid,
  validateInviteCode,
  validateLabelName,
  validateLobbyName,
} from "@/lib/validation/lobbies";

// Every action re-checks who is calling. Authorization itself is enforced by the
// database (RPC functions and row-level security), never by this code alone.

const BAD_REQUEST: FormState = {
  status: "error",
  message: "Something went wrong. Please refresh the page and try again.",
};
const OK: FormState = { status: "success" };

function revalidateMembers(lobbyId: string) {
  revalidatePath(`/lobbies/${lobbyId}/members`);
}

// --------------------------------------------------------------------------- lobbies

export async function createLobby(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const name = getString(formData, "name");
  const nameError = validateLobbyName(name);
  if (nameError) return { status: "error", fieldErrors: { name: nameError }, values: { name } };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_lobby", { p_name: name });
  if (error || typeof data !== "string") {
    console.error("create_lobby failed:", error?.message);
    return { status: "error", message: friendlyDbError(error?.message), values: { name } };
  }
  redirect(`/lobbies/${data}`);
}

export async function joinLobby(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const code = getString(formData, "code");
  const codeError = validateInviteCode(code);
  if (codeError) return { status: "error", fieldErrors: { code: codeError }, values: { code } };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("redeem_invite_code", { p_code: code });
  if (error) {
    console.error("redeem_invite_code failed:", error.message);
    return { status: "error", message: friendlyDbError(error.message), values: { code } };
  }

  const row = (Array.isArray(data) ? data[0] : data) as {
    status?: string;
    joined_lobby_id?: string;
  } | null;

  if ((row?.status === "joined" || row?.status === "already_member") && row.joined_lobby_id) {
    redirect(`/lobbies/${row.joined_lobby_id}`);
  }
  if (row?.status === "rate_limited") {
    return {
      status: "error",
      message: "Too many incorrect codes. Wait a few minutes and try again.",
      values: { code },
    };
  }
  return {
    status: "error",
    fieldErrors: { code: "That code is invalid or has expired." },
    values: { code },
  };
}

export async function generateInviteCode(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const lobbyId = getUuid(formData, "lobbyId");
  if (!lobbyId) return BAD_REQUEST;

  const supabase = await createClient();
  const { error } = await supabase.rpc("generate_invite_code", { p_lobby_id: lobbyId });
  if (error) {
    console.error("generate_invite_code failed:", error.message);
    return { status: "error", message: friendlyDbError(error.message) };
  }
  revalidateMembers(lobbyId);
  return OK;
}

export async function removeMember(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const lobbyId = getUuid(formData, "lobbyId");
  const userId = getUuid(formData, "userId");
  if (!lobbyId || !userId) return BAD_REQUEST;

  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_member", { p_lobby_id: lobbyId, p_user_id: userId });
  if (error) {
    console.error("remove_member failed:", error.message);
    return { status: "error", message: friendlyDbError(error.message) };
  }
  revalidateMembers(lobbyId);
  return OK;
}

export async function leaveLobby(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const lobbyId = getUuid(formData, "lobbyId");
  if (!lobbyId) return BAD_REQUEST;

  const supabase = await createClient();
  const { error } = await supabase.rpc("leave_lobby", { p_lobby_id: lobbyId });
  if (error) {
    console.error("leave_lobby failed:", error.message);
    return { status: "error", message: friendlyDbError(error.message) };
  }
  redirect("/");
}

export async function deleteLobby(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const lobbyId = getUuid(formData, "lobbyId");
  if (!lobbyId) return BAD_REQUEST;

  // Row-level security only allows the host to delete; a non-host deletes zero rows.
  const supabase = await createClient();
  const { data, error } = await supabase.from("lobbies").delete().eq("id", lobbyId).select("id");
  if (error) {
    console.error("delete lobby failed:", error.message);
    return { status: "error", message: friendlyDbError(error.message) };
  }
  if (!data || data.length === 0) {
    return { status: "error", message: "Only the lobby host can delete this lobby." };
  }
  redirect("/");
}

// ---------------------------------------------------------------------------- labels

export async function createLabel(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const lobbyId = getUuid(formData, "lobbyId");
  const name = getString(formData, "name");
  if (!lobbyId) return BAD_REQUEST;
  const nameError = validateLabelName(name);
  if (nameError) return { status: "error", fieldErrors: { name: nameError }, values: { name } };

  const supabase = await createClient();
  const { error } = await supabase.from("labels").insert({ lobby_id: lobbyId, name });
  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        fieldErrors: { name: "A label with that name already exists." },
        values: { name },
      };
    }
    console.error("create label failed:", error.message);
    return { status: "error", message: friendlyDbError(error.message), values: { name } };
  }
  revalidateMembers(lobbyId);
  return OK;
}

export async function renameLabel(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const lobbyId = getUuid(formData, "lobbyId");
  const labelId = getUuid(formData, "labelId");
  const name = getString(formData, "name");
  if (!lobbyId || !labelId) return BAD_REQUEST;
  const nameError = validateLabelName(name);
  if (nameError) return { status: "error", fieldErrors: { name: nameError }, values: { name } };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("labels")
    .update({ name })
    .eq("id", labelId)
    .eq("lobby_id", lobbyId)
    .select("id");
  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        fieldErrors: { name: "A label with that name already exists." },
        values: { name },
      };
    }
    console.error("rename label failed:", error.message);
    return { status: "error", message: friendlyDbError(error.message), values: { name } };
  }
  if (!data || data.length === 0) {
    return { status: "error", message: "Only the lobby host can edit labels.", values: { name } };
  }
  revalidateMembers(lobbyId);
  return { status: "success", message: "Saved." };
}

export async function deleteLabel(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const lobbyId = getUuid(formData, "lobbyId");
  const labelId = getUuid(formData, "labelId");
  if (!lobbyId || !labelId) return BAD_REQUEST;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("labels")
    .delete()
    .eq("id", labelId)
    .eq("lobby_id", lobbyId)
    .select("id");
  if (error) {
    console.error("delete label failed:", error.message);
    return { status: "error", message: friendlyDbError(error.message) };
  }
  if (!data || data.length === 0) {
    return { status: "error", message: "Only the lobby host can delete labels." };
  }
  revalidateMembers(lobbyId);
  return OK;
}

/** Replaces one member's labels with exactly the checked set. */
export async function setMemberLabels(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const lobbyId = getUuid(formData, "lobbyId");
  const userId = getUuid(formData, "userId");
  if (!lobbyId || !userId) return BAD_REQUEST;

  const selected = new Set(formData.getAll("labelIds").map(String).filter(isUuid));

  const supabase = await createClient();
  const { data: current, error: readError } = await supabase
    .from("member_labels")
    .select("label_id")
    .eq("lobby_id", lobbyId)
    .eq("user_id", userId);
  if (readError) {
    console.error("read member labels failed:", readError.message);
    return { status: "error", message: friendlyDbError(readError.message) };
  }

  const currentIds = new Set(((current ?? []) as { label_id: string }[]).map((r) => r.label_id));
  const toRemove = [...currentIds].filter((id) => !selected.has(id));
  const toAdd = [...selected].filter((id) => !currentIds.has(id));

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("member_labels")
      .delete()
      .eq("lobby_id", lobbyId)
      .eq("user_id", userId)
      .in("label_id", toRemove);
    if (error) {
      console.error("remove member labels failed:", error.message);
      return { status: "error", message: friendlyDbError(error.message) };
    }
  }
  if (toAdd.length > 0) {
    // Composite foreign keys reject labels from another lobby or non-members.
    const { error } = await supabase
      .from("member_labels")
      .insert(toAdd.map((labelId) => ({ label_id: labelId, lobby_id: lobbyId, user_id: userId })));
    if (error) {
      console.error("add member labels failed:", error.message);
      return { status: "error", message: friendlyDbError(error.message) };
    }
  }

  revalidateMembers(lobbyId);
  return OK;
}
