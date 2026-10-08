import { Badge } from "@/components/ui/badge";
import { ColorSwatch } from "@/features/games/components/color-swatch";
import type { Participant } from "@/features/games/types";

type ParticipantListProps = {
  participants: Participant[];
  /** Users still in the lobby. Anyone else is shown as a former member. */
  currentMemberIds?: ReadonlySet<string>;
  winnerId?: string | null;
};

export function ParticipantList({ participants, currentMemberIds, winnerId }: ParticipantListProps) {
  return (
    <ul aria-label="Players" className="flex flex-wrap gap-2">
      {participants.map((p) => (
        <li
          key={p.userId}
          className="flex items-center gap-2 rounded-full border border-border bg-white/60 px-3 py-1.5 text-sm"
        >
          <ColorSwatch color={p.color} />
          <span className="font-medium break-all">{p.username}</span>
          {p.color && <span className="text-muted">({p.color})</span>}
          {currentMemberIds && !currentMemberIds.has(p.userId) && <Badge>Former member</Badge>}
          {winnerId === p.userId && <Badge tone="brick">Winner</Badge>}
        </li>
      ))}
    </ul>
  );
}
