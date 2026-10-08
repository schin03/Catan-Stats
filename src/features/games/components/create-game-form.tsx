"use client";

import { useActionState, useState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { createGame } from "@/features/games/actions";
import { CATAN_COLORS } from "@/features/games/components/color-swatch";
import { initialFormState } from "@/lib/actions/form-state";

const MAX_PLAYERS = 4;
const MIN_PLAYERS = 2;

type MemberOption = { userId: string; username: string };

export function CreateGameForm({ lobbyId, members }: { lobbyId: string; members: MemberOption[] }) {
  const [state, formAction] = useActionState(createGame, initialFormState);
  const [selected, setSelected] = useState<string[]>([]);
  const [colors, setColors] = useState<Record<string, string>>({});

  function toggle(userId: string) {
    setSelected((prev) => {
      if (prev.includes(userId)) return prev.filter((id) => id !== userId);
      return prev.length >= MAX_PLAYERS ? prev : [...prev, userId];
    });
  }

  const usedColors = new Set(selected.map((id) => colors[id]).filter(Boolean));

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="lobbyId" value={lobbyId} />
      <fieldset className="space-y-1">
        <legend className="text-sm font-medium">Players (choose {MIN_PLAYERS}–{MAX_PLAYERS})</legend>
        <p className="text-sm text-muted">The player list is locked once the game starts.</p>
        <ul className="divide-y divide-border">
          {members.map((member) => {
            const isSelected = selected.includes(member.userId);
            const myColor = colors[member.userId] ?? "";
            return (
              <li key={member.userId} className="flex flex-wrap items-center justify-between gap-2 py-1">
                <label className="flex min-h-11 items-center gap-3 text-base">
                  <input
                    type="checkbox"
                    name="playerIds"
                    value={member.userId}
                    checked={isSelected}
                    disabled={!isSelected && selected.length >= MAX_PLAYERS}
                    onChange={() => toggle(member.userId)}
                    className="size-5 accent-forest"
                  />
                  <span className="break-all">{member.username}</span>
                </label>
                {isSelected && (
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-muted">Color (optional)</span>
                    <select
                      name={`color:${member.userId}`}
                      value={myColor}
                      onChange={(event) => setColors((prev) => ({ ...prev, [member.userId]: event.target.value }))}
                      className="min-h-11 rounded-md border border-border bg-white/70 px-2 text-base"
                    >
                      <option value="">None</option>
                      {CATAN_COLORS.map((color) => (
                        <option key={color} value={color} disabled={usedColors.has(color) && myColor !== color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>

      <p className="text-sm text-muted" aria-live="polite">
        {selected.length} of {MAX_PLAYERS} players selected
      </p>
      <FormMessage state={state} />
      <SubmitButton disabled={selected.length < MIN_PLAYERS} pendingText="Starting…">
        Start game
      </SubmitButton>
    </form>
  );
}
