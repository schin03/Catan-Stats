"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ConnectionStatus = "connecting" | "live" | "offline";

/**
 * Keeps the game page live. Realtime events are used ONLY as a "something changed"
 * signal: we never trust or display the event payload. Instead the page re-fetches its
 * data from the server, where row-level security decides what this person may see.
 */
export function GameLiveSync({ gameId }: { gameId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let hasConnectedBefore = false;

    // Renumbering after a delete fires many events at once; collapse them into one refresh.
    const scheduleRefresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 300);
    };

    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dice_rolls", filter: `game_id=eq.${gameId}` },
        scheduleRefresh,
      )
      // Supabase can't filter DELETE events, so listen to all and just refresh on any.
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "dice_rolls" }, scheduleRefresh)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        scheduleRefresh,
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "games" }, scheduleRefresh)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_participants", filter: `game_id=eq.${gameId}` },
        scheduleRefresh,
      )
      .subscribe((subscriptionStatus) => {
        if (subscriptionStatus === "SUBSCRIBED") {
          setStatus("live");
          // After a reconnect we may have missed events, so catch up.
          if (hasConnectedBefore) scheduleRefresh();
          hasConnectedBefore = true;
        } else if (
          subscriptionStatus === "CHANNEL_ERROR" ||
          subscriptionStatus === "TIMED_OUT" ||
          subscriptionStatus === "CLOSED"
        ) {
          setStatus("offline");
        }
      });

    // Phones suspend background tabs; catch up as soon as the person comes back.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") scheduleRefresh();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, [gameId, router]);

  const label =
    status === "live"
      ? "Live updates on"
      : status === "connecting"
        ? "Connecting to live updates…"
        : "Live updates are off. Reload the page to see new rolls.";

  return (
    <p role="status" className="flex items-center gap-2 text-sm text-muted">
      <span
        aria-hidden="true"
        className={`inline-block size-2.5 rounded-full ${
          status === "live" ? "bg-forest" : status === "connecting" ? "bg-wheat" : "bg-brick"
        }`}
      />
      {label}
    </p>
  );
}
