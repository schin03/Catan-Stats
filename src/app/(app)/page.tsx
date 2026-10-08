import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { CreateLobbyForm } from "@/features/lobbies/components/create-lobby-form";
import { JoinLobbyForm } from "@/features/lobbies/components/join-lobby-form";
import { LobbyList } from "@/features/lobbies/components/lobby-list";
import { getMyLobbies } from "@/features/lobbies/queries";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const lobbies = await getMyLobbies();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-bold">Your lobbies</h1>
      <LobbyList lobbies={lobbies} currentUserId={user.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card aria-labelledby="create-lobby-heading">
          <h2 id="create-lobby-heading" className="mb-4 font-serif text-lg font-semibold">
            Create a lobby
          </h2>
          <CreateLobbyForm />
        </Card>
        <Card aria-labelledby="join-lobby-heading">
          <h2 id="join-lobby-heading" className="mb-4 font-serif text-lg font-semibold">
            Join with a code
          </h2>
          <JoinLobbyForm />
        </Card>
      </div>
    </div>
  );
}
