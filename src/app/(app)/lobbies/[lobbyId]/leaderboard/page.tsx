import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { LeaderboardTable } from "@/features/lobbies/components/leaderboard-table";
import { getLobby, getLobbyRoster } from "@/features/lobbies/queries";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Leaderboard" };

type RpcRow = {
  user_id: string; username: string;
  games_played: number; wins: number;
  win_rate: number | null; avg_points: number | null;
};

export default async function LeaderboardPage({ params }: { params: Promise<{ lobbyId: string }> }) {
  const { lobbyId } = await params;
  const user = await requireUser();
  const lobby = await getLobby(lobbyId);
  if (!lobby) notFound();

  const supabase = await createClient();

  // Fetch all members' label assignments so the client can filter without another round trip.
  const { members, labels } = await getLobbyRoster(lobby.id);
  const labelIdsByUser = new Map(members.map((m) => [m.userId, m.labelIds]));

  const { data, error } = await supabase.rpc("lobby_leaderboard", { p_lobby_id: lobby.id });
  if (error) throw new Error(`Failed to load leaderboard: ${error.message}`);

  const rows = ((data ?? []) as RpcRow[]).map((row) => ({
    userId: row.user_id,
    username: row.username,
    gamesPlayed: row.games_played,
    wins: row.wins,
    winRate: row.win_rate,
    avgPoints: row.avg_points,
    labelIds: labelIdsByUser.get(row.user_id) ?? [],
  }));

  return (
    <Card aria-labelledby="leaderboard-heading">
      <h2 id="leaderboard-heading" className="mb-4 font-serif text-lg font-semibold">
        Leaderboard
      </h2>
      {rows.length === 0 ? (
        <p className="text-muted">No members yet.</p>
      ) : (
        <LeaderboardTable
          rows={rows}
          labels={labels}
          currentUserId={user.id}
        />
      )}
    </Card>
  );
}
