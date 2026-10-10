"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { Dialog } from "@/components/ui/dialog";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { deleteRoll, updateRoll } from "@/features/games/actions";
import { DicePicker } from "@/features/games/components/dice-picker";
import { EventDiePicker } from "@/features/games/components/event-die-picker";
import type { EventDie, Roll } from "@/features/games/types";
import { initialFormState, type FormState } from "@/lib/actions/form-state";

export function RollActions({ lobbyId, gameId, roll }: { lobbyId: string; gameId: string; roll: Roll }) {
  const [open, setOpen] = useState(false);
  const [red, setRed] = useState(roll.red);
  const [yellow, setYellow] = useState(roll.yellow);
  const [event, setEvent] = useState<EventDie | null>(roll.eventDie);

  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await updateRoll(prev, formData);
    if (result.status === "success") setOpen(false);
    return result;
  }, initialFormState);

  function openEditor() {
    setRed(roll.red);
    setYellow(roll.yellow);
    setEvent(roll.eventDie);
    setOpen(true);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={openEditor} aria-label={`Edit round ${roll.round}`}>
        Edit
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={`Edit round ${roll.round}`}>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="lobbyId" value={lobbyId} />
          <input type="hidden" name="gameId" value={gameId} />
          <input type="hidden" name="rollId" value={roll.id} />
          <DicePicker
            red={red}
            yellow={yellow}
            onChange={(die, value) => (die === "red" ? setRed(value) : setYellow(value))}
          />
          <p className="text-lg" aria-live="polite">
            Total: <strong>{red + yellow}</strong>
          </p>
          <EventDiePicker value={event} onChange={setEvent} />
          <FormMessage state={state} />
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
          </div>
        </form>
      </Dialog>
      <ConfirmActionButton
        triggerLabel="Delete"
        title={`Delete round ${roll.round}?`}
        description="This removes the roll and renumbers every later round so the game stays in order (1, 2, 3, …)."
        confirmLabel="Delete roll"
        action={deleteRoll}
        fields={{ lobbyId, gameId, rollId: roll.id }}
      />
    </div>
  );
}
