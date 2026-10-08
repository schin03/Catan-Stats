"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LobbyTabs({ lobbyId }: { lobbyId: string }) {
  const pathname = usePathname();
  const base = `/lobbies/${lobbyId}`;
  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/games`, label: "Games" },
    { href: `${base}/leaderboard`, label: "Leaderboard" },
    { href: `${base}/members`, label: "Members" },
  ];

  return (
    // Scrolls sideways on narrow phones instead of wrapping.
    <nav aria-label="Lobby sections" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1 border-b border-border">
        {tabs.map((tab) => {
          const active = pathname === tab.href || (tab.href !== base && pathname.startsWith(`${tab.href}/`));
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center whitespace-nowrap border-b-2 px-4 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sea ${
                  active ? "border-brick text-foreground" : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
