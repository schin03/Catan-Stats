"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { editCompletedGame, finishGame } from "@/features/games/finish-actions";
import type { GameStatus, Participant } from "@/features/games/types";
import { initialFormState, type FormState } from "@/lib/actions/form-state";

type FinishGameFormProps = {
  lobbyId: string;
  gameId: string;
  participants: Participant[];
  status: GameStatus;
  /** Present when the host is editing a completed game. */
  existingWinnerId?: string | null;
};

export function FinishGameForm({
  lobbyId,
  gameId,
  participants,
  status,
  existingWinnerId,
}: FinishGameFormProps) {
  const [open, setOpen] = useState(false);
  const isEdit = status === "completed";
  const action = isEdit ? editCompletedGame : finishGame;

  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result.status === "success") setOpen(false);
    return result;
  }, initialFormState);

  const [winnerId, setWinnerId] = useState(existingWinnerId ?? "");

  return (
    <>
      <Button variant={isEdit ? "secondary" : "primary"} onClick={() => setOpen(true)}>
        {isEdit ? "Edit scores & winner" : "Finish game"}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={isEdit ? "Edit scores & winner" : "Finish game"}
      >
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="lobbyId" value={lobbyId} />
          <input type="hidden" name="gameId" value={gameId} />
          <input type="hidden" name="winnerId" value={winnerId} />
          {participants.map((p) => (
            <input key={p.userId} type="hidden" name="playerIds" value={p.userId} />
          ))}

          <p className="text-sm text-muted">
            Enter a final score for each player and select one winner. Scores can tie; the winner
            is whoever you choose.
          </p>

          <fieldset className="space-y-3">
            <legend className="font-medium">Final scores</legend>
            {participants.map((p) => (
              <div key={p.userId} className="space-y-1">
                <label htmlFor={`score-${p.userId}`} className="block text-sm font-medium">
                  {p.username}
                </label>
                <input
                  id={`score-${p.userId}`}
                  name={`score:${p.userId}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={99}
                  required
                  defaultValue={p.score ?? ""}
                  aria-invalid={!!state.fieldErrors?.[`score:${p.userId}`]}
                  className="min-h-11 w-32 rounded-md border border-border bg-white/70 px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sea"
                />
                {state.fieldErrors?.[`score:${p.userId}`] && (
                  <p className="text-sm text-brick">{state.fieldErrors[`score:${p.userId}`]}</p>
                )}
              </div>
            ))}
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="font-medium">Winner</legend>
            {state.fieldErrors?.winnerId && (
              <p className="text-sm text-brick">{state.fieldErrors.winnerId}</p>
            )}
            {participants.map((p) => (
              <label key={p.userId} className="flex min-h-11 items-center gap-3 text-base">
                <input
                  type="radio"
                  name="winnerDisplay"
                  value={p.userId}
                  checked={winnerId === p.userId}
                  onChange={() => setWinnerId(p.userId)}
                  className="size-5 accent-forest"
                  required
                />
                {p.username}
              </label>
            ))}
          </fieldset>

          <FormMessage state={state} />
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton disabled={!winnerId} pendingText="Saving…">
              {isEdit ? "Save changes" : "Finish game"}
            </SubmitButton>
          </div>
        </form>
      </Dialog>
    </>
  );
}
