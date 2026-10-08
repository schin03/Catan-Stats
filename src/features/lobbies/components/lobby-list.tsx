import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { LobbyListItem } from "@/features/lobbies/types";

export function LobbyList({ lobbies, currentUserId }: { lobbies: LobbyListItem[]; currentUserId: string }) {
  if (lobbies.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-5 text-muted">
        You are not in any lobbies yet. Create one below, or join a friend&apos;s lobby with an invite code.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {lobbies.map((lobby) => (
        <li key={lobby.id}>
          <Link
            href={`/lobbies/${lobby.id}`}
            className="paper block min-h-11 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-brick focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea"
          >
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-serif text-lg font-semibold break-words">{lobby.name}</span>
              {lobby.hostId === currentUserId && <Badge tone="brick">Host</Badge>}
            </span>
            <span className="mt-1 block text-sm text-muted">
              Hosted by {lobby.hostUsername} · {lobby.memberCount} {lobby.memberCount === 1 ? "member" : "members"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
