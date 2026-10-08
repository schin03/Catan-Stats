import { Card } from "@/components/ui/card";

export const metadata = { title: "Overview" };

export default function LobbyOverviewPage() {
  return (
    <Card>
      <h2 className="font-serif text-lg font-semibold">Overview</h2>
      <p className="mt-1 text-muted">
        The active-game card, lobby statistics, and recent games will appear here once game tracking is built.
        For now, use the Members tab to invite friends and manage labels.
      </p>
    </Card>
  );
}
