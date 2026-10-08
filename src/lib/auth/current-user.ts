import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  /** The hidden login email; only used to re-verify the password. Never display it. */
  email: string;
  username: string;
};

/**
 * The signed-in user plus their username, or null.
 * getUser() re-validates the session with Supabase on every call, which is what
 * makes it safe to trust (getSession() only reads cookies). cache() makes
 * repeated calls within one request free.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  return { id: user.id, email: user.email ?? "", username: profile.username as string };
});
