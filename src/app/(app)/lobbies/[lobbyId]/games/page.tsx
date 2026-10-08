import { Card } from "@/components/ui/card";

export const metadata = { title: "Games" };

export default function LobbyGamesPage() {
  return (
    <Card>
      <h2 className="font-serif text-lg font-semibold">Games</h2>
      <p className="mt-1 text-muted">Starting games and the game history will appear here in an upcoming phase.</p>
    </Card>
  );
}
