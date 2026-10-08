import { describe, expect, it } from "vitest";
import { friendlyDbError } from "./errors";

describe("friendlyDbError", () => {
  it("translates known database error codes", () => {
    expect(friendlyDbError("not_authorized")).toMatch(/host/i);
    expect(friendlyDbError("host_cannot_leave")).toMatch(/delete the lobby/i);
  });

  it("treats row-level security violations as permission errors", () => {
    expect(friendlyDbError('new row violates row-level security policy for table "labels"')).toBe(
      friendlyDbError("not_authorized"),
    );
  });

  it("never echoes unknown internal errors", () => {
    const result = friendlyDbError('duplicate key value violates unique constraint "labels_pkey"');
    expect(result).not.toMatch(/constraint|labels_pkey/);
    expect(friendlyDbError(undefined)).toBe(result);
  });
});
