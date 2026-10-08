import type { FormState } from "@/lib/actions/form-state";

/** Form-level success/error message. Errors use role="alert" so screen readers announce them. */
export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  const isError = state.status === "error";
  return (
    <p
      role={isError ? "alert" : "status"}
      className={`rounded-md border px-3 py-2 text-sm ${
        isError ? "border-brick text-brick" : "border-forest text-forest"
      }`}
    >
      {state.message}
    </p>
  );
}
