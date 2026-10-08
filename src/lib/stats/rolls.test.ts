import { describe, expect, it } from "vitest";
import { computeDistribution, summarizeRolls } from "./rolls";

const rolls = (...totals: number[]) => totals.map((total) => ({ total }));

describe("computeDistribution", () => {
  it("returns all 11 totals from 2 to 12 with zeros for empty games", () => {
    const result = computeDistribution([]);
    expect(result).toHaveLength(11);
    expect(result[0]).toEqual({ total: 2, count: 0 });
    expect(result[10]).toEqual({ total: 12, count: 0 });
    expect(result.every((entry) => entry.count === 0)).toBe(true);
  });

  it("counts each total, treating 7 like any other", () => {
    const result = computeDistribution(rolls(7, 7, 6, 12, 7));
    expect(result.find((e) => e.total === 7)?.count).toBe(3);
    expect(result.find((e) => e.total === 6)?.count).toBe(1);
    expect(result.find((e) => e.total === 12)?.count).toBe(1);
    expect(result.find((e) => e.total === 2)?.count).toBe(0);
  });

  it("ignores impossible totals instead of crashing", () => {
    const result = computeDistribution(rolls(1, 13, 7));
    expect(result.reduce((sum, e) => sum + e.count, 0)).toBe(1);
  });
});

describe("summarizeRolls", () => {
  it("handles a game with no rolls", () => {
    expect(summarizeRolls([])).toEqual({ totalRolls: 0, mostFrequent: null, averageTotal: null });
  });

  it("finds the single most frequent total", () => {
    const summary = summarizeRolls(rolls(6, 8, 8, 5));
    expect(summary.totalRolls).toBe(4);
    expect(summary.mostFrequent).toEqual({ totals: [8], count: 2 });
  });

  it("reports every total in a tie, in ascending order", () => {
    const summary = summarizeRolls(rolls(8, 6, 8, 6, 9));
    expect(summary.mostFrequent).toEqual({ totals: [6, 8], count: 2 });
  });

  it("computes the average total", () => {
    expect(summarizeRolls(rolls(6, 8)).averageTotal).toBe(7);
    expect(summarizeRolls(rolls(2, 3)).averageTotal).toBe(2.5);
  });
});
