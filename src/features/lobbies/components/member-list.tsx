import { Badge } from "@/components/ui/badge";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { removeMember } from "@/features/lobbies/actions";
import { EditMemberLabels } from "@/features/lobbies/components/edit-member-labels";
import type { Label, Lobby, LobbyMember } from "@/features/lobbies/types";

type MemberListProps = {
  lobby: Lobby;
  members: LobbyMember[];
  labels: Label[];
  isHost: boolean;
  currentUserId: string;
};

export function MemberList({ lobby, members, labels, isHost, currentUserId }: MemberListProps) {
  const labelsById = new Map(labels.map((label) => [label.id, label]));
  // Host first, then everyone else (already alphabetical from the query).
  const sorted = [...members].sort((a, b) => Number(b.userId === lobby.hostId) - Number(a.userId === lobby.hostId));

  return (
    <ul className="divide-y divide-border">
      {sorted.map((member) => {
        const isMemberHost = member.userId === lobby.hostId;
        const memberLabels = member.labelIds
          .map((id) => labelsById.get(id))
          .filter((label): label is Label => label !== undefined);

        return (
          <li key={member.userId} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="min-w-0 space-y-1.5">
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-medium break-all">{member.username}</span>
                {isMemberHost && <Badge tone="brick">Host</Badge>}
                {member.userId === currentUserId && <Badge>You</Badge>}
              </p>
              {memberLabels.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" aria-label={`Labels for ${member.username}`}>
                  {memberLabels.map((label) => (
                    <li
                      key={label.id}
                      className="rounded-full border border-wheat/60 bg-wheat/25 px-2 py-0.5 text-xs font-medium"
                    >
                      {label.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {isHost && (
              <div className="flex flex-wrap gap-2">
                <EditMemberLabels
                  lobbyId={lobby.id}
                  userId={member.userId}
                  username={member.username}
                  labels={labels}
                  selectedIds={member.labelIds}
                />
                {!isMemberHost && (
                  <ConfirmActionButton
                    triggerLabel="Remove"
                    title={`Remove ${member.username}?`}
                    description="They lose access to this lobby right away. Their past games stay in the lobby history, and they can rejoin later with a new invite code."
                    confirmLabel="Remove member"
                    action={removeMember}
                    fields={{ lobbyId: lobby.id, userId: member.userId }}
                  />
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
