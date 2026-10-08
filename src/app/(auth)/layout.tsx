import { Card } from "@/components/ui/card";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="font-serif text-3xl font-bold">Catan Stat Tracker</h1>
        <p className="mt-1 text-muted">Dice rolls, scores, and bragging rights.</p>
      </div>
      <Card>{children}</Card>
    </main>
  );
}
