"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";
import { createLobby } from "@/features/lobbies/actions";
import { initialFormState } from "@/lib/actions/form-state";
import { LOBBY_NAME_MAX } from "@/lib/validation/lobbies";

export function CreateLobbyForm() {
  const [state, formAction] = useActionState(createLobby, initialFormState);

  return (
    <form action={formAction} className="space-y-4">
      <TextField
        label="Lobby name"
        name="name"
        type="text"
        required
        maxLength={LOBBY_NAME_MAX}
        hint="You will be the host. Only you can start games and record rolls."
        error={state.fieldErrors?.name}
        defaultValue={state.values?.name}
      />
      <FormMessage state={state} />
      <SubmitButton pendingText="Creating…">Create lobby</SubmitButton>
    </form>
  );
}
