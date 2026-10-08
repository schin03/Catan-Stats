import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Catan Stat Tracker", template: "%s · Catan Stat Tracker" },
  description: "Track dice rolls, scores, and wins for your Catan group.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
