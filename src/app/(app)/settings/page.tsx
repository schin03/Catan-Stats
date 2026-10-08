import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PasswordForm } from "@/features/profile/components/password-form";
import { UsernameForm } from "@/features/profile/components/username-form";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="font-serif text-2xl font-bold">Settings</h1>
      <Card aria-labelledby="username-heading">
        <h2 id="username-heading" className="mb-4 font-serif text-lg font-semibold">
          Username
        </h2>
        <UsernameForm currentUsername={user.username} />
      </Card>
      <Card aria-labelledby="password-heading">
        <h2 id="password-heading" className="mb-4 font-serif text-lg font-semibold">
          Password
        </h2>
        <PasswordForm />
      </Card>
    </div>
  );
}
