"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";
import { updateUsername } from "@/features/profile/actions";
import { initialFormState } from "@/lib/actions/form-state";

export function UsernameForm({ currentUsername }: { currentUsername: string }) {
  const [state, formAction] = useActionState(updateUsername, initialFormState);

  return (
    <form action={formAction} className="space-y-4">
      <TextField
        label="Username"
        name="username"
        type="text"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        required
        hint="3–20 characters: letters, numbers, and underscores."
        error={state.fieldErrors?.username}
        defaultValue={state.values?.username ?? currentUsername}
      />
      <FormMessage state={state} />
      <SubmitButton pendingText="Saving…">Save username</SubmitButton>
    </form>
  );
}
