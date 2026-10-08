"use client";

import { useActionState } from "react";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";
import { createLabel, deleteLabel, renameLabel } from "@/features/lobbies/actions";
import type { Label } from "@/features/lobbies/types";
import { initialFormState } from "@/lib/actions/form-state";
import { LABEL_NAME_MAX } from "@/lib/validation/lobbies";

function LabelRow({ lobbyId, label }: { lobbyId: string; label: Label }) {
  const [state, formAction] = useActionState(renameLabel, initialFormState);

  return (
    <li className="space-y-2 py-3">
      <div className="flex flex-wrap items-start gap-2">
        <form action={formAction} className="flex min-w-0 flex-1 basis-56 items-start gap-2">
          <input type="hidden" name="lobbyId" value={lobbyId} />
          <input type="hidden" name="labelId" value={label.id} />
          <div className="min-w-0 flex-1">
            <TextField
              label={`Rename label ${label.name}`}
              hideLabel
              name="name"
              required
              maxLength={LABEL_NAME_MAX}
              defaultValue={state.values?.name ?? label.name}
              error={state.fieldErrors?.name}
            />
          </div>
          <SubmitButton variant="secondary" pendingText="Saving…">
            Save
          </SubmitButton>
        </form>
        <ConfirmActionButton
          triggerLabel="Delete"
          title={`Delete the label “${label.name}”?`}
          description="It will be removed from every member who has it. This does not affect any game history."
          confirmLabel="Delete label"
          action={deleteLabel}
          fields={{ lobbyId, labelId: label.id }}
        />
      </div>
      <FormMessage state={state} />
    </li>
  );
}

export function LabelManager({ lobbyId, labels }: { lobbyId: string; labels: Label[] }) {
  const [state, formAction] = useActionState(createLabel, initialFormState);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="lobbyId" value={lobbyId} />
        <TextField
          label="New label"
          name="name"
          required
          maxLength={LABEL_NAME_MAX}
          hint="For example: Regulars, Family, Tuesday Night. Labels can be used to filter the leaderboard."
          error={state.fieldErrors?.name}
          defaultValue={state.values?.name}
        />
        <FormMessage state={state} />
        <SubmitButton pendingText="Adding…">Add label</SubmitButton>
      </form>

      {labels.length === 0 ? (
        <p className="text-sm text-muted">No labels yet.</p>
      ) : (
        <ul className="divide-y divide-border border-t border-border">
          {labels.map((label) => (
            <LabelRow key={label.id} lobbyId={lobbyId} label={label} />
          ))}
        </ul>
      )}
    </div>
  );
}
