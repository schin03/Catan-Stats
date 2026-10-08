"use client";

import { useActionState, useState } from "react";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialFormState, type FormState } from "@/lib/actions/form-state";

type ConfirmActionButtonProps = {
  triggerLabel: string;
  triggerVariant?: ButtonVariant;
  title: string;
  description: string;
  confirmLabel: string;
  /** Server action to run on confirm. */
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  /** Sent to the action as hidden form fields (e.g. lobbyId, userId). */
  fields: Record<string, string>;
};

/** A button that opens a confirmation dialog and only runs the action if confirmed. */
export function ConfirmActionButton({
  triggerLabel,
  triggerVariant = "secondary",
  title,
  description,
  confirmLabel,
  action,
  fields,
}: ConfirmActionButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result.status === "success") setOpen(false);
    return result;
  }, initialFormState);

  return (
    <>
      <Button variant={triggerVariant} onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title}>
        <p className="text-base">{description}</p>
        <form action={formAction} className="space-y-4">
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <FormMessage state={state} />
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton variant="danger" pendingText="Working…">
              {confirmLabel}
            </SubmitButton>
          </div>
        </form>
      </Dialog>
    </>
  );
}
