import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <h2 className="mb-4 font-serif text-xl font-semibold">Log in</h2>
      <LoginForm />
    </>
  );
}
