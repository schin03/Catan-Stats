import { EventDieChip } from "@/features/games/components/event-die-picker";
import { RollActions } from "@/features/games/components/roll-actions";
import type { Roll } from "@/features/games/types";

const VISIBLE_ROWS = 6;
const ROW_HEIGHT = 53; // px — matches the py-3 padding + one line of text

export function RollHistory({
  rolls,
  isHost,
  lobbyId,
  gameId,
}: {
  rolls: Roll[];
  isHost: boolean;
  lobbyId: string;
  gameId: string;
}) {
  if (rolls.length === 0) {
    return <p className="text-muted">No rolls recorded yet.</p>;
  }

  const hasEventDie = rolls.some((r) => r.eventDie !== null);
  const newestFirst = [...rolls].sort((a, b) => b.round - a.round);
  const needsScroll = rolls.length > VISIBLE_ROWS;

  return (
    <div className="space-y-1">
      {/*
        Single table. thead is sticky so it stays visible while tbody scrolls.
        The outer div is the scroll container; overflow-x-auto handles narrow phones.
        We only apply a fixed height (and therefore scrolling) once there are
        more rows than VISIBLE_ROWS, so short games still look natural.
      */}
      <div
        className="overflow-x-auto overflow-y-auto overscroll-contain rounded-md border border-border"
        style={needsScroll ? { maxHeight: `${VISIBLE_ROWS * ROW_HEIGHT + 41}px` } : undefined}
        role={needsScroll ? "region" : undefined}
        aria-label={needsScroll ? "Scrollable roll history" : undefined}
        tabIndex={needsScroll ? 0 : undefined}
      >
        <table className="w-full text-left">
          <caption className="sr-only">Roll history, newest first</caption>
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border text-sm text-muted">
              <th scope="col" className="py-2 pl-3 pr-4 font-medium">Round</th>
              <th scope="col" className="py-2 pr-4 font-medium">Red</th>
              <th scope="col" className="py-2 pr-4 font-medium">Yellow</th>
              <th scope="col" className="py-2 pr-4 font-medium">Total</th>
              {hasEventDie && (
                <th scope="col" className="py-2 pr-4 font-medium">Event</th>
              )}
              {isHost && (
                <th scope="col" className="py-2 pr-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {newestFirst.map((roll) => (
              <tr key={roll.id}>
                <th scope="row" className="py-3 pl-3 pr-4 font-medium">{roll.round}</th>
                <td className="py-3 pr-4">{roll.red}</td>
                <td className="py-3 pr-4">{roll.yellow}</td>
                <td className="py-3 pr-4 font-semibold">{roll.total}</td>
                {hasEventDie && (
                  <td className="py-3 pr-4">
                    {roll.eventDie
                      ? <EventDieChip value={roll.eventDie} />
                      : <span className="text-muted">–</span>}
                  </td>
                )}
                {isHost && (
                  <td className="py-3 pr-3">
                    <RollActions lobbyId={lobbyId} gameId={gameId} roll={roll} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {needsScroll && (
        <p className="text-right text-xs text-muted">
          {rolls.length} rolls total — scroll to see earlier rounds
        </p>
      )}
    </div>
  );
}
