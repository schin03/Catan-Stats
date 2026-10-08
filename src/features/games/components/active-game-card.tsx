import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ParticipantList } from "@/features/games/components/participant-list";
import type { ActiveGameSummary } from "@/features/games/types";

export function ActiveGameCard({ lobbyId, summary }: { lobbyId: string; summary: ActiveGameSummary }) {
  const { game, participants, rollCount } = summary;
  return (
    <Card aria-labelledby="active-game-heading" className="border-forest border-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <h2 id="active-game-heading" className="font-serif text-lg font-semibold">
            <span aria-hidden="true" className="mr-2 inline-block size-2.5 rounded-full bg-forest" />
            Game in progress
          </h2>
          <ParticipantList participants={participants} />
          <p className="text-sm text-muted">
            {rollCount} {rollCount === 1 ? "roll" : "rolls"} recorded
          </p>
        </div>
        <Link
          href={`/lobbies/${lobbyId}/games/${game.id}`}
          className="inline-flex min-h-11 items-center rounded-md bg-forest px-4 py-2 text-base font-semibold text-card hover:bg-forest/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea"
        >
          Open live game
        </Link>
      </div>
    </Card>
  );
}
