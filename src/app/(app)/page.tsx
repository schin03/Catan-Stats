import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-bold">Welcome, {user?.username}</h1>
      <Card>
        <h2 className="font-serif text-lg font-semibold">Your lobbies</h2>
        <p className="mt-1 text-muted">Lobbies arrive in the next phase. For now, you&apos;re signed in.</p>
      </Card>
    </div>
  );
}
