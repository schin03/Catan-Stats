import Link from "next/link";
import { Card } from "@/components/ui/card";

// Shown when something doesn't exist OR the person has no access to it. The two cases
// look identical on purpose, so nobody can discover which lobbies or games exist.
export default function NotFound() {
  return (
    <Card className="mx-auto max-w-md space-y-3 text-center">
      <h1 className="font-serif text-xl font-semibold">Not found</h1>
      <p className="text-muted">
        This page may have been deleted, or you may not have access to it. If you were invited to a lobby, ask the
        host for a fresh code.
      </p>
      <Link href="/" className="inline-block font-medium text-sea underline">
        Back to your lobbies
      </Link>
    </Card>
  );
}
