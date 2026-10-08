// Pure statistics over a list of rolls. Kept free of any database or UI code so it is
// easy to test. (Lobby-wide leaderboards are computed in SQL; this is per-game display.)

export type RollLike = { total: number };
export type DistributionEntry = { total: number; count: number };

export const POSSIBLE_TOTALS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

/** Count of rolls for every total from 2 to 12, including totals that never came up. */
export function computeDistribution(rolls: readonly RollLike[]): DistributionEntry[] {
  const counts = new Map<number, number>(POSSIBLE_TOTALS.map((total) => [total, 0]));
  for (const roll of rolls) {
    if (counts.has(roll.total)) counts.set(roll.total, (counts.get(roll.total) ?? 0) + 1);
  }
  return POSSIBLE_TOTALS.map((total) => ({ total, count: counts.get(total) ?? 0 }));
}

export type RollSummary = {
  totalRolls: number;
  /** Every total tied for most frequent, ascending. null when there are no rolls. */
  mostFrequent: { totals: number[]; count: number } | null;
  averageTotal: number | null;
};

export function summarizeRolls(rolls: readonly RollLike[]): RollSummary {
  if (rolls.length === 0) return { totalRolls: 0, mostFrequent: null, averageTotal: null };

  const distribution = computeDistribution(rolls);
  const max = Math.max(...distribution.map((entry) => entry.count));
  const totals = distribution.filter((entry) => entry.count === max).map((entry) => entry.total);
  const sum = rolls.reduce((acc, roll) => acc + roll.total, 0);

  return {
    totalRolls: rolls.length,
    mostFrequent: { totals, count: max },
    averageTotal: sum / rolls.length,
  };
}
