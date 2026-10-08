import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <>
      <h2 className="mb-4 font-serif text-xl font-semibold">Create your account</h2>
      <SignupForm />
    </>
  );
}
