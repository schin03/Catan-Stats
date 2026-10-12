"use client";

import Link from "next/link";
import {useActionState} from "react";
import {FormMessage} from "@/components/ui/form-message";
import {SubmitButton} from "@/components/ui/submit-button";
import {TextField} from "@/components/ui/text-field";
import {logIn} from "@/features/auth/actions";
import {initialFormState} from "@/lib/actions/form-state";

export function LoginForm() {
    const [state, formAction] = useActionState(logIn, initialFormState);

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
                defaultValue={state.values?.username}
            />
            <TextField label="Password" name="password" type="password" autoComplete="current-password" required/>
            <FormMessage state={state}/>
            <SubmitButton className="w-full" pendingText="Logging in…">
                Log in
            </SubmitButton>
            <p className="text-center text-sm text-muted">
                New here?{" "}
                <Link href="/signup" className="font-medium text-sea underline">
                    Create an account
                </Link>
            </p>
            {/* Demo account — remove if this stops being a portfolio project */}
            <button
                type="button"
                className="w-full rounded-md border border-border bg-white/50 py-2 text-sm text-muted hover:bg-border/30"
                onClick={() => {
                    const form = document.querySelector("form");
                    if (!form) return;
                    (form.querySelector('[name="username"]') as HTMLInputElement).value = "demo";
                    (form.querySelector('[name="password"]') as HTMLInputElement).value = "demo1234";
                }}
            >
                Fill in demo credentials
            </button>
        </form>
    );
}
