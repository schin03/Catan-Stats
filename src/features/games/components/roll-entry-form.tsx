"use client";

import { useActionState, useState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { addRoll } from "@/features/games/actions";
import { DicePicker } from "@/features/games/components/dice-picker";
import { EventDiePicker } from "@/features/games/components/event-die-picker";
import type { EventDie } from "@/features/games/types";
import { initialFormState, type FormState } from "@/lib/actions/form-state";

export function RollEntryForm({
  lobbyId,
  gameId,
  nextRound,
}: {
  lobbyId: string;
  gameId: string;
  nextRound: number;
}) {
  const [red, setRed] = useState<number | null>(null);
  const [yellow, setYellow] = useState<number | null>(null);
  const [event, setEvent] = useState<EventDie | null>(null);

  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await addRoll(prev, formData);
    if (result.status === "success") {
      setRed(null);
      setYellow(null);
      setEvent(null);
    }
    return result;
  }, initialFormState);

  const ready = red !== null && yellow !== null;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="lobbyId" value={lobbyId} />
      <input type="hidden" name="gameId" value={gameId} />
      <DicePicker
        red={red}
        yellow={yellow}
        onChange={(die, value) => (die === "red" ? setRed(value) : setYellow(value))}
      />
      <p className="text-lg" aria-live="polite">
        Total: <strong>{ready ? red + yellow : "–"}</strong>
      </p>
      <EventDiePicker value={event} onChange={setEvent} />
      <FormMessage state={state} />
      <SubmitButton disabled={!ready} pendingText="Saving…" className="w-full sm:w-auto">
        Record roll for round {nextRound}
      </SubmitButton>
    </form>
  );
}
