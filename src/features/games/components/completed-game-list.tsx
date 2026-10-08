import Link from "next/link";
import type { CompletedGameListItem } from "@/features/games/queries-completed";

function formatDate(iso: string | null): string {
  if (!iso) return "Unknown date";
  return new Intl.DateTimeFormat("en-CA", {
    month: "short", day: "numeric", year: "numeric",
  }).format(new Date(iso));
}

export function CompletedGameList({
  items,
  lobbyId,
}: {
  items: CompletedGameListItem[];
  lobbyId: string;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-5 text-muted">
        No completed games yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {items.map(({ game, participants }) => {
        const winner = participants.find((p) => p.userId === game.winnerId);
        const scores = [...participants].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

        return (
          <li key={game.id}>
            <Link
              href={`/lobbies/${lobbyId}/games/${game.id}`}
              className="block py-4 hover:bg-border/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea rounded-md px-1"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">
                  {winner ? `🏆 ${winner.username}` : "No winner recorded"}
                </p>
                <p className="text-sm text-muted">{formatDate(game.completedAt)}</p>
              </div>
              <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-muted">
                {scores.map((p) => (
                  <li key={p.userId}>
                    {p.username}: <span className="font-medium text-foreground">{p.score ?? "–"}</span>
                  </li>
                ))}
              </ul>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
