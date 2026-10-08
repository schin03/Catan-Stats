import { isUuid } from "@/lib/validation/lobbies";

/** Trimmed string field (empty string if missing). Do not use for passwords. */
export function getString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/** A UUID field, or null if missing or malformed. */
export function getUuid(formData: FormData, key: string): string | null {
  const value = getString(formData, key);
  return isUuid(value) ? value : null;
}
