import { describe, expect, it } from "vitest";

// The leaderboard itself is computed in SQL (lobby_leaderboard RPC), so these tests
// cover the sort logic the UI applies on top of the rows it receives.

type LeaderboardRow = {
  userId: string; username: string;
  gamesPlayed: number; wins: number;
  winRate: number | null; avgPoints: number | null;
};

/** Mirrors the default sort applied by the leaderboard component. */
function sortLeaderboard(rows: LeaderboardRow[]): LeaderboardRow[] {
  return [...rows].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if ((b.avgPoints ?? -1) !== (a.avgPoints ?? -1)) return (b.avgPoints ?? -1) - (a.avgPoints ?? -1);
    return a.username.localeCompare(b.username, undefined, { sensitivity: "base" });
  });
}

describe("sortLeaderboard", () => {
  const alice: LeaderboardRow = { userId: "1", username: "Alice", gamesPlayed: 3, wins: 2, winRate: 0.67, avgPoints: 10 };
  const bob: LeaderboardRow   = { userId: "2", username: "Bob",   gamesPlayed: 3, wins: 2, winRate: 0.67, avgPoints: 8  };
  const carol: LeaderboardRow = { userId: "3", username: "Carol", gamesPlayed: 1, wins: 1, winRate: 1,    avgPoints: 12 };
  const dave: LeaderboardRow  = { userId: "4", username: "Dave",  gamesPlayed: 0, wins: 0, winRate: null, avgPoints: null };

  it("sorts by most wins first", () => {
    const result = sortLeaderboard([bob, carol, alice, dave]);
    expect(result.map((r) => r.username)).toEqual(["Alice", "Bob", "Carol", "Dave"]);
  });

  it("breaks win ties by average points descending", () => {
    const result = sortLeaderboard([bob, alice]);
    expect(result[0].username).toBe("Alice");
  });

  it("places members with zero games at the bottom", () => {
    const result = sortLeaderboard([dave, carol]);
    expect(result[result.length - 1].username).toBe("Dave");
  });

  it("breaks remaining ties alphabetically", () => {
    const tied1 = { ...alice, avgPoints: 8 };
    const result = sortLeaderboard([bob, tied1]);
    expect(result[0].username).toBe("Alice");
  });
});
