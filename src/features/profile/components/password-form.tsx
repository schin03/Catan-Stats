"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";
import { updatePassword } from "@/features/profile/actions";
import { initialFormState } from "@/lib/actions/form-state";

export function PasswordForm() {
  const [state, formAction] = useActionState(updatePassword, initialFormState);

  return (
    <form action={formAction} className="space-y-4">
      <TextField
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.currentPassword}
      />
      <TextField
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 8 characters."
        error={state.fieldErrors?.newPassword}
      />
      <TextField
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirmPassword}
      />
      <FormMessage state={state} />
      <SubmitButton pendingText="Updating…">Update password</SubmitButton>
    </form>
  );
}
