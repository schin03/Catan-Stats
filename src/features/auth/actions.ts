"use server";

import { redirect } from "next/navigation";
import { makeSyntheticEmail } from "@/lib/auth/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/actions/form-state";
import {
  validatePassword,
  validatePasswordConfirmation,
  validateUsername,
} from "@/lib/validation/auth";

// One message for every login failure, so nobody can probe which usernames exist.
const INVALID_LOGIN = "Invalid username or password.";

async function findUserIdByUsername(username: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("get_user_id_by_username", { p_username: username });
  if (error) {
    console.error("get_user_id_by_username failed:", error.message);
    return null;
  }
  return (data as string | null) ?? null;
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: Record<string, string> = {};
  const usernameError = validateUsername(username);
  if (usernameError) fieldErrors.username = usernameError;
  const passwordError = validatePassword(password);
  if (passwordError) fieldErrors.password = passwordError;
  const confirmError = validatePasswordConfirmation(password, confirmPassword);
  if (!passwordError && confirmError) fieldErrors.confirmPassword = confirmError;

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors, values: { username } };
  }

  const takenState: FormState = {
    status: "error",
    fieldErrors: { username: "That username is already taken." },
    values: { username },
  };

  if (await findUserIdByUsername(username)) return takenState;

  // The database trigger creates the matching profile in the same transaction.
  // If two people race for one username, the loser's createUser fails here.
  const admin = createAdminClient();
  const email = makeSyntheticEmail();
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (createError) {
    if (await findUserIdByUsername(username)) return takenState;
    console.error("signUp createUser failed:", createError.message);
    return {
      status: "error",
      message: "Couldn't create your account. Please try again.",
      values: { username },
    };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    // Account exists but the automatic sign-in failed; let them log in manually.
    redirect("/login");
  }
  redirect("/");
}

export async function logIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const invalid: FormState = { status: "error", message: INVALID_LOGIN, values: { username } };

  if (!username || !password) return invalid;

  const userId = await findUserIdByUsername(username);
  if (!userId) {
    console.error("[login] no account found for that username");
    return invalid;
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  const email = data?.user?.email;
  if (error || !email) {
    console.error("[login] could not fetch account email:", error?.message ?? "user has no email");
    return invalid;
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    console.error("[login] sign-in rejected:", signInError.message, signInError.code);
    return invalid;
  }

  redirect("/");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
