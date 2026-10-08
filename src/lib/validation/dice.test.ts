import { describe, expect, it } from "vitest";
import { isValidDie, parseDie, validateDiceInput } from "./dice";

describe("isValidDie", () => {
  it("accepts integers 1 through 6", () => {
    for (const n of [1, 2, 3, 4, 5, 6]) expect(isValidDie(n)).toBe(true);
  });
  it("rejects 0, 7, negatives, fractions, and non-numbers", () => {
    for (const n of [0, 7, -1, 1.5, NaN, Infinity]) expect(isValidDie(n)).toBe(false);
    expect(isValidDie("3")).toBe(false);
    expect(isValidDie(null)).toBe(false);
    expect(isValidDie(undefined)).toBe(false);
  });
});

describe("parseDie", () => {
  it("parses single digits 1-6", () => {
    expect(parseDie("1")).toBe(1);
    expect(parseDie("6")).toBe(6);
  });
  it("rejects everything else", () => {
    for (const raw of ["", "0", "7", "10", "01", "3.5", " 3", "three", "-2"]) {
      expect(parseDie(raw)).toBeNull();
    }
  });
});

describe("validateDiceInput", () => {
  it("returns both values when valid, including 7 as a total of 3 + 4", () => {
    expect(validateDiceInput("3", "4")).toEqual({ ok: true, red: 3, yellow: 4 });
  });
  it("says which die is missing or invalid", () => {
    expect(validateDiceInput("", "4")).toMatchObject({ ok: false, error: expect.stringMatching(/red/i) });
    expect(validateDiceInput("3", "9")).toMatchObject({ ok: false, error: expect.stringMatching(/yellow/i) });
    expect(validateDiceInput("", "")).toMatchObject({ ok: false, error: expect.stringMatching(/both/i) });
  });
});
