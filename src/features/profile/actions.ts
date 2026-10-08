"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/actions/form-state";
import {
  validatePassword,
  validatePasswordConfirmation,
  validateUsername,
} from "@/lib/validation/auth";

export async function updateUsername(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const username = String(formData.get("username") ?? "").trim();
  const usernameError = validateUsername(username);
  if (usernameError) {
    return { status: "error", fieldErrors: { username: usernameError }, values: { username } };
  }
  if (username === user.username) {
    return { status: "success", message: "That's already your username.", values: { username } };
  }

  // Runs as the signed-in user: RLS only lets them update their own profile row,
  // and column grants only let them change `username`.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", user.id)
    .select("id");

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        fieldErrors: { username: "That username is already taken." },
        values: { username },
      };
    }
    console.error("updateUsername failed:", error.message);
    return { status: "error", message: "Couldn't update your username.", values: { username } };
  }
  if (!data || data.length === 0) {
    return { status: "error", message: "Couldn't update your username.", values: { username } };
  }

  revalidatePath("/", "layout");
  return { status: "success", message: "Username updated.", values: { username } };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!currentPassword) fieldErrors.currentPassword = "Enter your current password.";
  const newError = validatePassword(newPassword);
  if (newError) fieldErrors.newPassword = newError;
  const confirmError = validatePasswordConfirmation(newPassword, confirmPassword);
  if (!newError && confirmError) fieldErrors.confirmPassword = confirmError;
  if (!newError && currentPassword && newPassword === currentPassword) {
    fieldErrors.newPassword = "New password must be different from the current one.";
  }
  if (Object.keys(fieldErrors).length > 0) return { status: "error", fieldErrors };

  const supabase = await createClient();

  // Re-verify the current password so a borrowed, unlocked session can't change it.
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) {
    return { status: "error", fieldErrors: { currentPassword: "Current password is incorrect." } };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    console.error("updatePassword failed:", error.message);
    return { status: "error", message: "Couldn't update your password. Please try again." };
  }
  return { status: "success", message: "Password updated." };
}
