import Link from "next/link";
import { Card } from "@/components/ui/card";

// Shown when a lobby doesn't exist OR the person isn't a member of it. The two cases
// look identical on purpose, so nobody can discover which lobbies exist.
export default function NotFound() {
  return (
    <Card className="mx-auto max-w-md space-y-3 text-center">
      <h1 className="font-serif text-xl font-semibold">Lobby not found</h1>
      <p className="text-muted">
        This lobby may have been deleted, or you may no longer be a member of it. If you were invited, ask the
        host for a fresh code.
      </p>
      <Link href="/" className="inline-block font-medium text-sea underline">
        Back to your lobbies
      </Link>
    </Card>
  );
}
