import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { deleteLobby, leaveLobby } from "@/features/lobbies/actions";
import { InviteCodePanel } from "@/features/lobbies/components/invite-code-panel";
import { LabelManager } from "@/features/lobbies/components/label-manager";
import { MemberList } from "@/features/lobbies/components/member-list";
import { getActiveInviteCode, getLobby, getLobbyRoster } from "@/features/lobbies/queries";
import { requireUser } from "@/lib/auth/require-user";

export const metadata = { title: "Members" };

export default async function MembersPage({ params }: { params: Promise<{ lobbyId: string }> }) {
  const { lobbyId } = await params;
  const user = await requireUser();
  const lobby = await getLobby(lobbyId);
  if (!lobby) notFound();

  const isHost = lobby.hostId === user.id;
  const { members, labels } = await getLobbyRoster(lobby.id);
  const invite = isHost ? await getActiveInviteCode(lobby.id) : null;

  return (
    <div className="space-y-6">
      <Card aria-labelledby="members-heading">
        <h2 id="members-heading" className="mb-2 font-serif text-lg font-semibold">
          Members ({members.length})
        </h2>
        <MemberList lobby={lobby} members={members} labels={labels} isHost={isHost} currentUserId={user.id} />
      </Card>

      {isHost && (
        <>
          <Card aria-labelledby="invite-heading">
            <h2 id="invite-heading" className="mb-4 font-serif text-lg font-semibold">
              Invite friends
            </h2>
            <InviteCodePanel lobbyId={lobby.id} invite={invite} />
          </Card>

          <Card aria-labelledby="labels-heading">
            <h2 id="labels-heading" className="mb-4 font-serif text-lg font-semibold">
              Labels
            </h2>
            <LabelManager lobbyId={lobby.id} labels={labels} />
          </Card>
        </>
      )}

      <Card aria-labelledby="danger-heading" className="border-brick/50">
        <h2 id="danger-heading" className="mb-2 font-serif text-lg font-semibold">
          {isHost ? "Delete lobby" : "Leave lobby"}
        </h2>
        {isHost ? (
          <>
            <p className="mb-4 text-muted">
              As the host you cannot leave this lobby. You can delete it, which permanently removes the lobby and all
              of its games and statistics for every member.
            </p>
            <ConfirmActionButton
              triggerLabel="Delete lobby"
              triggerVariant="danger"
              title={`Delete “${lobby.name}”?`}
              description="This permanently deletes the lobby and every game, dice roll, and statistic in it, for all members. This cannot be undone."
              confirmLabel="Delete lobby forever"
              action={deleteLobby}
              fields={{ lobbyId: lobby.id }}
            />
          </>
        ) : (
          <>
            <p className="mb-4 text-muted">
              You will lose access to this lobby. Games you played in stay in its history, and you can rejoin later
              with a new invite code.
            </p>
            <ConfirmActionButton
              triggerLabel="Leave lobby"
              triggerVariant="danger"
              title={`Leave “${lobby.name}”?`}
              description="You will lose access to this lobby right away. Your past games remain in its history, and you can rejoin with a new invite code."
              confirmLabel="Leave lobby"
              action={leaveLobby}
              fields={{ lobbyId: lobby.id }}
            />
          </>
        )}
      </Card>
    </div>
  );
}
