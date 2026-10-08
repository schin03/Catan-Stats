import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ActiveGameCard } from "@/features/games/components/active-game-card";
import { CompletedGameList } from "@/features/games/components/completed-game-list";
import { CreateGameForm } from "@/features/games/components/create-game-form";
import { getActiveGame } from "@/features/games/queries";
import { getCompletedGames } from "@/features/games/queries-completed";
import { getLobby, getLobbyRoster } from "@/features/lobbies/queries";
import { requireUser } from "@/lib/auth/require-user";

export const metadata = { title: "Games" };

export default async function LobbyGamesPage({ params }: { params: Promise<{ lobbyId: string }> }) {
  const { lobbyId } = await params;
  const user = await requireUser();
  const lobby = await getLobby(lobbyId);
  if (!lobby) notFound();

  const isHost = lobby.hostId === user.id;
  const [active, completed] = await Promise.all([
    getActiveGame(lobby.id),
    getCompletedGames(lobby.id),
  ]);
  const roster = isHost && !active ? await getLobbyRoster(lobby.id) : null;

  return (
    <div className="space-y-4">
      {active && <ActiveGameCard lobbyId={lobby.id} summary={active} />}

      {!active && isHost && roster && (
        <Card aria-labelledby="new-game-heading">
          <h2 id="new-game-heading" className="mb-4 font-serif text-lg font-semibold">
            Start a new game
          </h2>
          {roster.members.length < 2 ? (
            <p className="text-muted">
              You need at least 2 members to start a game. Invite friends from the Members tab.
            </p>
          ) : (
            <CreateGameForm
              lobbyId={lobby.id}
              members={roster.members.map((m) => ({ userId: m.userId, username: m.username }))}
            />
          )}
        </Card>
      )}

      {!active && !isHost && (
        <Card>
          <h2 className="font-serif text-lg font-semibold">No game in progress</h2>
          <p className="mt-1 text-muted">
            {lobby.hostUsername} can start a game whenever the group is ready.
          </p>
        </Card>
      )}

      <Card aria-labelledby="completed-heading">
        <h2 id="completed-heading" className="mb-4 font-serif text-lg font-semibold">
          Completed games ({completed.length})
        </h2>
        <CompletedGameList items={completed} lobbyId={lobby.id} />
      </Card>
    </div>
  );
}
