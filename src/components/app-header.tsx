import Link from "next/link";
import { SubmitButton } from "@/components/ui/submit-button";
import { signOut } from "@/features/auth/actions";

export function AppHeader({ username }: { username: string }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="font-serif text-xl font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea"
        >
          Catan Stat Tracker
        </Link>
        <nav aria-label="Account" className="flex items-center gap-3">
          <Link
            href="/settings"
            className="rounded-md px-2 py-1 text-sm font-medium text-sea underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea"
          >
            {username}
          </Link>
          <form action={signOut}>
            <SubmitButton variant="secondary" pendingText="Signing out…">
              Sign out
            </SubmitButton>
          </form>
        </nav>
      </div>
    </header>
  );
}
