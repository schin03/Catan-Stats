import { describe, expect, it } from "vitest";
import { validatePassword, validatePasswordConfirmation, validateUsername } from "./auth";

describe("validateUsername", () => {
  it("accepts letters, numbers, and underscores", () => {
    expect(validateUsername("Sam_42")).toBeNull();
  });

  it("accepts the boundary lengths 3 and 20", () => {
    expect(validateUsername("abc")).toBeNull();
    expect(validateUsername("a".repeat(20))).toBeNull();
  });

  it("rejects usernames outside 3-20 characters", () => {
    expect(validateUsername("ab")).not.toBeNull();
    expect(validateUsername("a".repeat(21))).not.toBeNull();
    expect(validateUsername("")).not.toBeNull();
  });

  it("rejects spaces, punctuation, and non-ASCII characters", () => {
    expect(validateUsername("two words")).not.toBeNull();
    expect(validateUsername("sam!")).not.toBeNull();
    expect(validateUsername("sam-lee")).not.toBeNull();
    expect(validateUsername("sámm")).not.toBeNull();
  });
});

describe("validatePassword", () => {
  it("requires at least 8 characters", () => {
    expect(validatePassword("1234567")).not.toBeNull();
    expect(validatePassword("12345678")).toBeNull();
  });

  it("allows up to 72 bytes and rejects more", () => {
    expect(validatePassword("a".repeat(72))).toBeNull();
    expect(validatePassword("a".repeat(73))).not.toBeNull();
  });

  it("counts bytes, not characters, for the upper limit", () => {
    // 37 two-byte characters = 74 bytes, but only 37 characters.
    expect(validatePassword("é".repeat(37))).not.toBeNull();
  });
});

describe("validatePasswordConfirmation", () => {
  it("passes only when both values match", () => {
    expect(validatePasswordConfirmation("secret123", "secret123")).toBeNull();
    expect(validatePasswordConfirmation("secret123", "secret124")).not.toBeNull();
  });
});
