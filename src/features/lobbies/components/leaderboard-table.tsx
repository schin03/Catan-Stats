"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export type LeaderboardRow = {
  userId: string;
  username: string;
  gamesPlayed: number;
  wins: number;
  winRate: number | null;
  avgPoints: number | null;
};

type SortKey = "wins" | "gamesPlayed" | "winRate" | "avgPoints";
type SortDir = "asc" | "desc";

function sort(rows: LeaderboardRow[], key: SortKey, dir: SortDir): LeaderboardRow[] {
  return [...rows].sort((a, b) => {
    const av = a[key] ?? -Infinity;
    const bv = b[key] ?? -Infinity;
    const primary = dir === "desc" ? bv - av : av - bv;
    if (primary !== 0) return primary;
    if (key !== "wins" && b.wins !== a.wins) return b.wins - a.wins;
    if (key !== "avgPoints" && (b.avgPoints ?? -1) !== (a.avgPoints ?? -1))
      return (b.avgPoints ?? -1) - (a.avgPoints ?? -1);
    return a.username.localeCompare(b.username, undefined, { sensitivity: "base" });
  });
}

// aria-sort belongs on the <th>, not the <button> inside it.
function SortButton({
  label, sortKey, current, dir, onClick,
}: { label: string; sortKey: SortKey; current: SortKey; dir: SortDir; onClick: () => void }) {
  const active = sortKey === current;
  const arrow = active ? (dir === "desc" ? " ↓" : " ↑") : "";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left text-sm font-medium ${active ? "text-foreground" : "text-muted"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea`}
    >
      {label}{arrow}
    </button>
  );
}

type LabelOption = { id: string; name: string };

export function LeaderboardTable({
  rows,
  labels,
  currentUserId,
}: {
  rows: LeaderboardRow[];
  labels: LabelOption[];
  currentUserId: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("wins");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  function toggleLabel(id: string) {
    setSelectedLabels((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  }

  const filtered =
    selectedLabels.length === 0
      ? rows
      : rows.filter((r) =>
          selectedLabels.some((lid) => (r as LeaderboardRow & { labelIds?: string[] }).labelIds?.includes(lid))
        );

  const sorted = sort(filtered, sortKey, sortDir);

  function ariaSort(key: SortKey): "ascending" | "descending" | "none" {
    if (sortKey !== key) return "none";
    return sortDir === "desc" ? "descending" : "ascending";
  }

  return (
    <div className="space-y-4">
      {labels.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Filter by label:</span>
          {labels.map((label) => (
            <button
              key={label.id}
              type="button"
              onClick={() => toggleLabel(label.id)}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea ${
                selectedLabels.includes(label.id)
                  ? "border-wheat bg-wheat/30 text-foreground"
                  : "border-border text-muted hover:border-wheat/60"
              }`}
              aria-pressed={selectedLabels.includes(label.id)}
            >
              {label.name}
            </button>
          ))}
          {selectedLabels.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedLabels([])}
              className="text-sm text-sea underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-muted">No members match the selected labels.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">Lobby leaderboard</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-2 pr-3 text-sm font-medium text-muted">#</th>
                <th scope="col" className="py-2 pr-3 text-sm font-medium text-muted">Player</th>
                <th scope="col" className="py-2 pr-3" aria-sort={ariaSort("gamesPlayed")}>
                  <SortButton label="Games" sortKey="gamesPlayed" current={sortKey} dir={sortDir} onClick={() => handleSort("gamesPlayed")} />
                </th>
                <th scope="col" className="py-2 pr-3" aria-sort={ariaSort("wins")}>
                  <SortButton label="Wins" sortKey="wins" current={sortKey} dir={sortDir} onClick={() => handleSort("wins")} />
                </th>
                <th scope="col" className="py-2 pr-3" aria-sort={ariaSort("winRate")}>
                  <SortButton label="Win %" sortKey="winRate" current={sortKey} dir={sortDir} onClick={() => handleSort("winRate")} />
                </th>
                <th scope="col" className="py-2" aria-sort={ariaSort("avgPoints")}>
                  <SortButton label="Avg pts" sortKey="avgPoints" current={sortKey} dir={sortDir} onClick={() => handleSort("avgPoints")} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((row, index) => (
                <tr key={row.userId} className={row.userId === currentUserId ? "bg-wheat/15" : ""}>
                  <td className="py-3 pr-3 text-muted">{index + 1}</td>
                  <td className="py-3 pr-3">
                    <span className="font-medium">{row.username}</span>
                    {row.userId === currentUserId && (
                      <span className="ml-2"><Badge>You</Badge></span>
                    )}
                    {row.wins >= 1 && index === 0 && (
                      <span aria-hidden="true" className="ml-1">🏆</span>
                    )}
                  </td>
                  <td className="py-3 pr-3">{row.gamesPlayed}</td>
                  <td className="py-3 pr-3 font-semibold">{row.wins}</td>
                  <td className="py-3 pr-3">
                    {row.winRate === null ? "–" : `${Math.round(row.winRate * 100)}%`}
                  </td>
                  <td className="py-3">
                    {row.avgPoints === null ? "–" : Number(row.avgPoints).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
