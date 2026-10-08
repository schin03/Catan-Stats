"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { generateInviteCode } from "@/features/lobbies/actions";
import type { InviteCode } from "@/features/lobbies/types";
import { initialFormState } from "@/lib/actions/form-state";
import { useNow } from "@/lib/hooks/use-now";

function formatRemaining(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function InviteCodePanel({ lobbyId, invite }: { lobbyId: string; invite: InviteCode | null }) {
  const now = useNow();
  const [state, formAction] = useActionState(generateInviteCode, initialFormState);
  const [copied, setCopied] = useState(false);

  // now === 0 means the clock hasn't started yet (server render): show the code, no timer.
  const remaining = invite && now > 0 ? Math.max(0, Math.floor((Date.parse(invite.expiresAt) - now) / 1000)) : null;
  const expired = remaining === 0;

  async function copyCode() {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; the code is still on screen to read out.
    }
  }

  return (
    <div className="space-y-4">
      {invite && !expired ? (
        <div className="rounded-md border border-border bg-white/60 p-4 text-center">
          <p className="text-sm text-muted">Invite code (case-sensitive)</p>
          <p className="my-2 font-mono text-4xl font-bold tracking-[0.25em] select-all">{invite.code}</p>
          <p className="mb-3 text-sm text-muted">
            {remaining === null ? "Valid for 10 minutes." : `Expires in ${formatRemaining(remaining)}`}
          </p>
          <Button variant="secondary" onClick={copyCode}>
            {copied ? "Copied!" : "Copy code"}
          </Button>
          <span className="sr-only" role="status">
            {copied ? "Code copied to clipboard" : ""}
          </span>
        </div>
      ) : (
        <p className="text-muted">
          {invite ? "The last code has expired." : "There is no active code."} Generate one to invite someone.
        </p>
      )}

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="lobbyId" value={lobbyId} />
        <FormMessage state={state} />
        <SubmitButton variant={invite && !expired ? "secondary" : "primary"} pendingText="Generating…">
          {invite && !expired ? "Generate new code" : "Generate code"}
        </SubmitButton>
        <p className="text-sm text-muted">Generating a new code immediately replaces the previous one.</p>
      </form>
    </div>
  );
}
