import { RollActions } from "@/features/games/components/roll-actions";
import type { Roll } from "@/features/games/types";

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

  // Newest first, so the latest roll is always at the top of the list.
  const newestFirst = [...rolls].sort((a, b) => b.round - a.round);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <caption className="sr-only">Roll history, newest first</caption>
        <thead>
          <tr className="border-b border-border text-sm text-muted">
            <th scope="col" className="py-2 pr-3 font-medium">Round</th>
            <th scope="col" className="py-2 pr-3 font-medium">Red</th>
            <th scope="col" className="py-2 pr-3 font-medium">Yellow</th>
            <th scope="col" className="py-2 pr-3 font-medium">Total</th>
            {isHost && (
              <th scope="col" className="py-2 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {newestFirst.map((roll) => (
            <tr key={roll.id}>
              <th scope="row" className="py-2 pr-3 font-medium">{roll.round}</th>
              <td className="py-2 pr-3">{roll.red}</td>
              <td className="py-2 pr-3">{roll.yellow}</td>
              <td className="py-2 pr-3 font-semibold">{roll.total}</td>
              {isHost && (
                <td className="py-2">
                  <RollActions lobbyId={lobbyId} gameId={gameId} roll={roll} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
