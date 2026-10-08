import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ActiveGameCard } from "@/features/games/components/active-game-card";
import { CompletedGameList } from "@/features/games/components/completed-game-list";
import { getActiveGame } from "@/features/games/queries";
import { getCompletedGames } from "@/features/games/queries-completed";
import { getLobby, getLobbyRoster } from "@/features/lobbies/queries";
import { requireUser } from "@/lib/auth/require-user";

export const metadata = { title: "Overview" };

export default async function LobbyOverviewPage({ params }: { params: Promise<{ lobbyId: string }> }) {
  const { lobbyId } = await params;
  const user = await requireUser();
  const lobby = await getLobby(lobbyId);
  if (!lobby) notFound();

  const isHost = lobby.hostId === user.id;
  const [active, completed, { members }] = await Promise.all([
    getActiveGame(lobby.id),
    getCompletedGames(lobby.id),
    getLobbyRoster(lobby.id),
  ]);

  const wins = completed.reduce<Record<string, number>>((acc, { game }) => {
    if (game.winnerId) acc[game.winnerId] = (acc[game.winnerId] ?? 0) + 1;
    return acc;
  }, {});
  const topWinner = Object.entries(wins).sort((a, b) => b[1] - a[1])[0];
  const topWinnerName = topWinner
    ? (members.find((m) => m.userId === topWinner[0])?.username ?? "Former member")
    : null;

  return (
    <div className="space-y-4">
      {active ? (
        <ActiveGameCard lobbyId={lobby.id} summary={active} />
      ) : (
        <Card>
          <h2 className="font-serif text-lg font-semibold">No game in progress</h2>
          <p className="mt-1 text-muted">
            {isHost ? (
              <>
                Ready to play?{" "}
                <Link href={`/lobbies/${lobby.id}/games`} className="font-medium text-sea underline">
                  Start a game
                </Link>
                .
              </>
            ) : (
              `${lobby.hostUsername} can start a game whenever the group is ready.`
            )}
          </p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Games played", value: completed.length },
          { label: "Members", value: members.length },
          { label: "Top winner", value: topWinnerName ?? "–" },
        ].map(({ label, value }) => (
          <Card key={label} className="text-center">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 font-serif text-2xl font-bold break-words">{value}</p>
          </Card>
        ))}
      </div>

      <Card aria-labelledby="recent-games-heading">
        <h2 id="recent-games-heading" className="mb-4 font-serif text-lg font-semibold">
          Recent games
        </h2>
        <CompletedGameList items={completed.slice(0, 5)} lobbyId={lobby.id} />
        {completed.length > 5 && (
          <Link
            href={`/lobbies/${lobby.id}/games`}
            className="mt-3 inline-block text-sm font-medium text-sea underline"
          >
            See all {completed.length} games →
          </Link>
        )}
      </Card>
    </div>
  );
}
