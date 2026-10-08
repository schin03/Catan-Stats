import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";

/** The signed-in user, or a redirect to /login. Use at the top of actions and pages. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
