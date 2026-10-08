import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { deleteGame } from "@/features/games/actions";
import { DiceChart } from "@/features/games/components/dice-chart";
import { GameLiveSync } from "@/features/games/components/game-live-sync";
import { ParticipantList } from "@/features/games/components/participant-list";
import { RollEntryForm } from "@/features/games/components/roll-entry-form";
import { RollHistory } from "@/features/games/components/roll-history";
import { getGame } from "@/features/games/queries";
import { getLobby, getLobbyRoster } from "@/features/lobbies/queries";
import { requireUser } from "@/lib/auth/require-user";
import { computeDistribution, summarizeRolls } from "@/lib/stats/rolls";

export const metadata = { title: "Game" };

export default async function GamePage({ params }: { params: Promise<{ lobbyId: string; gameId: string }> }) {
  const { lobbyId, gameId } = await params;
  const user = await requireUser();
  const lobby = await getLobby(lobbyId);
  if (!lobby) notFound();
  const game = await getGame(lobby.id, gameId);
  if (!game) notFound();

  const { members } = await getLobbyRoster(lobby.id);
  const currentMemberIds = new Set(members.map((m) => m.userId));
  const isHost = lobby.hostId === user.id;
  const isActive = game.status === "active";

  const distribution = computeDistribution(game.rolls);
  const summary = summarizeRolls(game.rolls);
  const nextRound = game.rolls.length + 1;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link href={`/lobbies/${lobby.id}/games`} className="text-sm font-medium text-sea underline">
          ← Back to games
        </Link>
        <GameLiveSync gameId={game.id} />
      </div>

      <Card aria-labelledby="game-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-3">
            <h2 id="game-heading" className="font-serif text-xl font-semibold">
              {isActive ? "Game in progress" : "Completed game"}
            </h2>
            <ParticipantList
              participants={game.participants}
              currentMemberIds={currentMemberIds}
              winnerId={game.winnerId}
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-muted">{isActive ? "Current round" : "Rounds played"}</p>
            <p className="font-serif text-4xl font-bold">{isActive ? nextRound : game.rolls.length}</p>
            <p className="text-sm text-muted">
              {summary.totalRolls} {summary.totalRolls === 1 ? "roll" : "rolls"} recorded
            </p>
          </div>
        </div>
      </Card>

      {isHost ? (
        <Card aria-labelledby="record-heading">
          <h2 id="record-heading" className="mb-4 font-serif text-lg font-semibold">
            Record a roll
          </h2>
          <RollEntryForm lobbyId={lobby.id} gameId={game.id} nextRound={nextRound} />
        </Card>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-4 text-muted">
          You are viewing this game live. Only {lobby.hostUsername}, the host, can record or change rolls.
        </p>
      )}

      <Card aria-labelledby="chart-heading">
        <h2 id="chart-heading" className="mb-4 font-serif text-lg font-semibold">
          Dice distribution
        </h2>
        <dl className="mb-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <dt className="text-sm text-muted">Total rolls</dt>
            <dd className="text-xl font-bold">{summary.totalRolls}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Most frequent</dt>
            <dd className="text-xl font-bold">
              {summary.mostFrequent ? summary.mostFrequent.totals.join(", ") : "–"}
            </dd>
            {summary.mostFrequent && (
              <dd className="text-xs text-muted">
                {summary.mostFrequent.count}× {summary.mostFrequent.totals.length > 1 ? "each" : ""}
              </dd>
            )}
          </div>
          <div>
            <dt className="text-sm text-muted">Average total</dt>
            <dd className="text-xl font-bold">
              {summary.averageTotal === null ? "–" : summary.averageTotal.toFixed(1)}
            </dd>
          </div>
        </dl>
        <DiceChart data={distribution} />
      </Card>

      <Card aria-labelledby="history-heading">
        <h2 id="history-heading" className="mb-4 font-serif text-lg font-semibold">
          Roll history
        </h2>
        <RollHistory rolls={game.rolls} isHost={isHost} lobbyId={lobby.id} gameId={game.id} />
      </Card>

      {isHost && (
        <Card aria-labelledby="delete-game-heading" className="border-brick/50">
          <h2 id="delete-game-heading" className="mb-2 font-serif text-lg font-semibold">
            Delete this game
          </h2>
          <p className="mb-4 text-muted">
            Permanently removes the game, its rolls, and its scores.
            {isActive ? "" : " This will change the lobby statistics and leaderboard."}
          </p>
          <ConfirmActionButton
            triggerLabel="Delete game"
            triggerVariant="danger"
            title="Delete this game?"
            description={
              isActive
                ? "This permanently deletes the game in progress and all of its rolls. You can start a new game afterwards. This cannot be undone."
                : "This permanently deletes the game, its rolls, and its scores. Lobby statistics and leaderboard results will change. This cannot be undone."
            }
            confirmLabel="Delete game forever"
            action={deleteGame}
            fields={{ lobbyId: lobby.id, gameId: game.id }}
          />
        </Card>
      )}
    </div>
  );
}
