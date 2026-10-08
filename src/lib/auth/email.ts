// Supabase Auth needs an email per account, but this app is username-based.
// Each account gets a random, never-displayed, never-sent-to address.
// It is NOT derived from the username, so renaming a user never touches Auth.
//
// If Supabase ever rejects this domain ("email_address_invalid"), change it here.
export const AUTH_EMAIL_DOMAIN = "users.catan.invalid";

export function makeSyntheticEmail(): string {
  return `${crypto.randomUUID()}@${AUTH_EMAIL_DOMAIN}`;
}
