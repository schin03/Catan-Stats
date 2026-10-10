import { describe, expect, it } from "vitest";
import { isValidDie, parseDie, parseEventDie, validateDiceInput } from "./dice";

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

describe("parseEventDie", () => {
  it("accepts the four valid faces", () => {
    for (const face of ["black", "yellow", "green", "grey"]) {
      expect(parseEventDie(face)).toBe(face);
    }
  });
  it("rejects other strings", () => {
    expect(parseEventDie("")).toBeNull();
    expect(parseEventDie("red")).toBeNull();
    expect(parseEventDie("Black")).toBeNull();
  });
});

describe("validateDiceInput", () => {
  it("returns values when both dice are valid and event die is empty", () => {
    expect(validateDiceInput("3", "4", "")).toEqual({
      ok: true, red: 3, yellow: 4, eventDie: null,
    });
  });
  it("returns eventDie when a valid event face is given", () => {
    expect(validateDiceInput("2", "5", "black")).toEqual({
      ok: true, red: 2, yellow: 5, eventDie: "black",
    });
  });
  it("says which numeric die is missing or invalid", () => {
    expect(validateDiceInput("", "4", "")).toMatchObject({ ok: false, error: expect.stringMatching(/red/i) });
    expect(validateDiceInput("3", "9", "")).toMatchObject({ ok: false, error: expect.stringMatching(/yellow/i) });
    expect(validateDiceInput("", "", "")).toMatchObject({ ok: false, error: expect.stringMatching(/both/i) });
  });
  it("rejects an invalid event die value", () => {
    expect(validateDiceInput("3", "4", "purple")).toMatchObject({ ok: false });
  });
});
