import Link from "next/link";
import { notFound } from "next/navigation";
import { LobbyTabs } from "@/features/lobbies/components/lobby-tabs";
import { getLobby } from "@/features/lobbies/queries";

export default async function LobbyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lobbyId: string }>;
}) {
  const { lobbyId } = await params;
  const lobby = await getLobby(lobbyId);
  if (!lobby) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link href="/" className="text-sm font-medium text-sea underline">
          ← All lobbies
        </Link>
        <h1 className="mt-1 font-serif text-2xl font-bold break-words">{lobby.name}</h1>
        <p className="text-muted">Hosted by {lobby.hostUsername}</p>
      </div>
      <LobbyTabs lobbyId={lobby.id} />
      {children}
    </div>
  );
}
