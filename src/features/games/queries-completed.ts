import "server-only";
import {cache} from "react";
import {createClient} from "@/lib/supabase/server";
import type {Game, Participant} from "./types";

export type CompletedGameListItem = {
    game: Game;
    participants: Participant[];
};

/** The 50 most-recent completed games for a lobby, newest first. */
export const getCompletedGames = cache(async (lobbyId: string): Promise<CompletedGameListItem[]> => {
    const supabase = await createClient();
    const {data, error} = await supabase
        .from("games")
        .select(
            "id, lobby_id, status, winner_id, created_at, completed_at, " +
            "game_participants!game_participants_game_id_fkey(user_id, color, score, profile:profiles!user_id(username))",
        )
        .eq("lobby_id", lobbyId)
        .eq("status", "completed")
        .order("completed_at", {ascending: false})
        .limit(50);

    if (error) throw new Error(`Failed to load games: ${error.message}`);

    type Row = {
        id: string; lobby_id: string; status: string; winner_id: string | null;
        created_at: string; completed_at: string | null;
        game_participants: {
            user_id: string; color: string | null; score: number | null;
            profile: { username: string } | null
        }[];
    };

    return ((data ?? []) as unknown as Row[]).map((row) => ({
        game: {
            id: row.id, lobbyId: row.lobby_id, status: row.status as "completed",
            winnerId: row.winner_id, createdAt: row.created_at, completedAt: row.completed_at,
        },
        participants: row.game_participants
            .map((p) => ({
                userId: p.user_id, username: p.profile?.username ?? "Unknown",
                color: p.color, score: p.score,
            }))
            .sort((a, b) =>
                a.username.localeCompare(b.username, undefined, {sensitivity: "base"})
            ),
    }));
});
