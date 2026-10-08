"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";
import { signUp } from "@/features/auth/actions";
import { initialFormState } from "@/lib/actions/form-state";

export function SignupForm() {
  const [state, formAction] = useActionState(signUp, initialFormState);

  return (
    <form action={formAction} className="space-y-4">
      <TextField
        label="Username"
        name="username"
        type="text"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        required
        hint="3–20 characters: letters, numbers, and underscores."
        error={state.fieldErrors?.username}
        defaultValue={state.values?.username}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 8 characters."
        error={state.fieldErrors?.password}
      />
      <TextField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirmPassword}
      />
      <FormMessage state={state} />
      <SubmitButton className="w-full" pendingText="Creating account…">
        Create account
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-sea underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
