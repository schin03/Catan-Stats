import { Card } from "@/components/ui/card";

export const metadata = { title: "Leaderboard" };

export default function LobbyLeaderboardPage() {
  return (
    <Card>
      <h2 className="font-serif text-lg font-semibold">Leaderboard</h2>
      <p className="mt-1 text-muted">Wins, win rate, and average points will appear here once games are recorded.</p>
    </Card>
  );
}
