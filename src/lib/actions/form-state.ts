// Shared shape returned by every form server action.
// Lives outside "use server" files because those may only export async functions.

export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
  /** Non-sensitive values to re-fill the form with after an error. Never passwords. */
  values?: Partial<Record<string, string>>;
};

export const initialFormState: FormState = { status: "idle" };
