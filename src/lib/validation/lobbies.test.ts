import { describe, expect, it } from "vitest";
import { isUuid, validateInviteCode, validateLabelName, validateLobbyName } from "./lobbies";

describe("validateLobbyName", () => {
  it("accepts 1 to 50 characters", () => {
    expect(validateLobbyName("Tuesday Night Catan")).toBeNull();
    expect(validateLobbyName("a")).toBeNull();
    expect(validateLobbyName("a".repeat(50))).toBeNull();
  });
  it("rejects empty and over-long names", () => {
    expect(validateLobbyName("")).not.toBeNull();
    expect(validateLobbyName("a".repeat(51))).not.toBeNull();
  });
});

describe("validateLabelName", () => {
  it("accepts 1 to 30 characters", () => {
    expect(validateLabelName("Regulars")).toBeNull();
    expect(validateLabelName("a".repeat(30))).toBeNull();
  });
  it("rejects empty and over-long labels", () => {
    expect(validateLabelName("")).not.toBeNull();
    expect(validateLabelName("a".repeat(31))).not.toBeNull();
  });
});

describe("validateInviteCode", () => {
  it("accepts exactly 6 letters/digits, in either case", () => {
    expect(validateInviteCode("aB3xK9")).toBeNull();
    expect(validateInviteCode("ABCDEF")).toBeNull();
  });
  it("rejects wrong lengths and symbols", () => {
    expect(validateInviteCode("abc12")).not.toBeNull();
    expect(validateInviteCode("abc1234")).not.toBeNull();
    expect(validateInviteCode("abc 12")).not.toBeNull();
    expect(validateInviteCode("abc-12")).not.toBeNull();
    expect(validateInviteCode("")).not.toBeNull();
  });
});

describe("isUuid", () => {
  it("recognises UUIDs and rejects other strings", () => {
    expect(isUuid("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("")).toBe(false);
    expect(isUuid("123e4567-e89b-12d3-a456-42661417400")).toBe(false);
  });
});
