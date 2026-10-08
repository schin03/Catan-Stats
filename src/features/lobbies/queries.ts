import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation/lobbies";
import type { InviteCode, Label, Lobby, LobbyListItem, LobbyMember } from "./types";

// All reads run as the signed-in user, so row-level security decides what comes back:
// a lobby you don't belong to simply doesn't exist as far as these queries can tell.
// cache() de-duplicates identical calls within one request (layout + page).

type LobbyRow = {
  id: string;
  name: string;
  host_id: string;
  created_at: string;
  host: { username: string } | null;
};

function toLobby(row: LobbyRow): Lobby {
  return {
    id: row.id,
    name: row.name,
    hostId: row.host_id,
    hostUsername: row.host?.username ?? "Unknown",
    createdAt: row.created_at,
  };
}

export const getMyLobbies = cache(async (): Promise<LobbyListItem[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lobbies")
    .select("id, name, host_id, created_at, host:profiles!host_id(username), lobby_members(count)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load lobbies: ${error.message}`);

  const rows = (data ?? []) as unknown as (LobbyRow & { lobby_members: { count: number }[] })[];
  return rows.map((row) => ({ ...toLobby(row), memberCount: row.lobby_members[0]?.count ?? 0 }));
});

/** The lobby, or null if it doesn't exist or the caller isn't a member. */
export const getLobby = cache(async (lobbyId: string): Promise<Lobby | null> => {
  if (!isUuid(lobbyId)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lobbies")
    .select("id, name, host_id, created_at, host:profiles!host_id(username)")
    .eq("id", lobbyId)
    .maybeSingle();
  if (error) throw new Error(`Failed to load lobby: ${error.message}`);
  return data ? toLobby(data as unknown as LobbyRow) : null;
});

export const getLobbyRoster = cache(
  async (lobbyId: string): Promise<{ members: LobbyMember[]; labels: Label[] }> => {
    const supabase = await createClient();
    const [membersRes, labelsRes, assignmentsRes] = await Promise.all([
      supabase
        .from("lobby_members")
        .select("user_id, joined_at, profile:profiles!user_id(username)")
        .eq("lobby_id", lobbyId),
      supabase.from("labels").select("id, name").eq("lobby_id", lobbyId).order("name"),
      supabase.from("member_labels").select("label_id, user_id").eq("lobby_id", lobbyId),
    ]);

    for (const res of [membersRes, labelsRes, assignmentsRes]) {
      if (res.error) throw new Error(`Failed to load lobby roster: ${res.error.message}`);
    }

    const labelIdsByUser = new Map<string, string[]>();
    for (const row of (assignmentsRes.data ?? []) as { label_id: string; user_id: string }[]) {
      labelIdsByUser.set(row.user_id, [...(labelIdsByUser.get(row.user_id) ?? []), row.label_id]);
    }

    const memberRows = (membersRes.data ?? []) as unknown as {
      user_id: string;
      joined_at: string;
      profile: { username: string } | null;
    }[];

    const members: LobbyMember[] = memberRows
      .map((row) => ({
        userId: row.user_id,
        username: row.profile?.username ?? "Unknown",
        joinedAt: row.joined_at,
        labelIds: labelIdsByUser.get(row.user_id) ?? [],
      }))
      .sort((a, b) => a.username.localeCompare(b.username, undefined, { sensitivity: "base" }));

    return { members, labels: (labelsRes.data ?? []) as Label[] };
  },
);

/** The host's current unexpired invite code, or null. RLS only lets the host read it. */
export const getActiveInviteCode = cache(async (lobbyId: string): Promise<InviteCode | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lobby_invite_codes")
    .select("code, expires_at")
    .eq("lobby_id", lobbyId)
    .maybeSingle();
  if (error) throw new Error(`Failed to load invite code: ${error.message}`);
  if (!data) return null;

  const row = data as { code: string; expires_at: string };
  if (Date.parse(row.expires_at) <= Date.now()) return null;
  return { code: row.code, expiresAt: row.expires_at };
});
