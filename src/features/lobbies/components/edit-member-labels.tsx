"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { setMemberLabels } from "@/features/lobbies/actions";
import type { Label } from "@/features/lobbies/types";
import { initialFormState, type FormState } from "@/lib/actions/form-state";

type EditMemberLabelsProps = {
  lobbyId: string;
  userId: string;
  username: string;
  labels: Label[];
  selectedIds: string[];
};

export function EditMemberLabels({ lobbyId, userId, username, labels, selectedIds }: EditMemberLabelsProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await setMemberLabels(prev, formData);
    if (result.status === "success") setOpen(false);
    return result;
  }, initialFormState);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} aria-label={`Edit labels for ${username}`}>
        Labels
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={`Labels for ${username}`}>
        {labels.length === 0 ? (
          <>
            <p className="text-muted">No labels exist yet. Create some in the Labels section first.</p>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </>
        ) : (
          // Keyed on the saved selection so the checkboxes reset to the saved state.
          <form key={selectedIds.join(",")} action={formAction} className="space-y-4">
            <input type="hidden" name="lobbyId" value={lobbyId} />
            <input type="hidden" name="userId" value={userId} />
            <fieldset className="space-y-1">
              <legend className="sr-only">Labels</legend>
              {labels.map((label) => (
                <label key={label.id} className="flex min-h-11 items-center gap-3 text-base">
                  <input
                    type="checkbox"
                    name="labelIds"
                    value={label.id}
                    defaultChecked={selectedIds.includes(label.id)}
                    className="size-5 accent-forest"
                  />
                  {label.name}
                </label>
              ))}
            </fieldset>
            <FormMessage state={state} />
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <SubmitButton pendingText="Saving…">Save labels</SubmitButton>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
