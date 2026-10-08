import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ActiveGameCard } from "@/features/games/components/active-game-card";
import { getActiveGame } from "@/features/games/queries";
import { getLobby } from "@/features/lobbies/queries";
import { requireUser } from "@/lib/auth/require-user";

export const metadata = { title: "Overview" };

export default async function LobbyOverviewPage({ params }: { params: Promise<{ lobbyId: string }> }) {
  const { lobbyId } = await params;
  const user = await requireUser();
  const lobby = await getLobby(lobbyId);
  if (!lobby) notFound();

  const active = await getActiveGame(lobby.id);
  const isHost = lobby.hostId === user.id;

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

      <Card>
        <h2 className="font-serif text-lg font-semibold">Lobby statistics</h2>
        <p className="mt-1 text-muted">
          Aggregate stats and recent completed games will appear here once games can be finished.
        </p>
      </Card>
    </div>
  );
}
