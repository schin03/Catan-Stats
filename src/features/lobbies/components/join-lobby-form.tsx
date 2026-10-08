"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";
import { joinLobby } from "@/features/lobbies/actions";
import { initialFormState } from "@/lib/actions/form-state";
import { INVITE_CODE_LENGTH } from "@/lib/validation/lobbies";

export function JoinLobbyForm() {
  const [state, formAction] = useActionState(joinLobby, initialFormState);

  return (
    <form action={formAction} className="space-y-4">
      <TextField
        label="Invite code"
        name="code"
        type="text"
        required
        maxLength={INVITE_CODE_LENGTH}
        // Codes are case-sensitive, so phones must not auto-capitalise or auto-correct.
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        className="font-mono text-lg tracking-widest"
        hint="Ask the host for a code. Codes are case-sensitive and expire after 10 minutes."
        error={state.fieldErrors?.code}
        defaultValue={state.values?.code}
      />
      <FormMessage state={state} />
      <SubmitButton pendingText="Joining…">Join lobby</SubmitButton>
    </form>
  );
}
