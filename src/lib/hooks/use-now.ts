import { useSyncExternalStore } from "react";

// A shared clock that ticks once per second, for countdowns.
// The server snapshot is 0, so server-rendered HTML never contains a time-dependent
// value; components treat 0 as "clock not started yet".
let currentTime = 0;

function subscribe(onChange: () => void) {
  currentTime = Date.now();
  const id = setInterval(() => {
    currentTime = Date.now();
    onChange();
  }, 1000);
  return () => clearInterval(id);
}

const getSnapshot = () => currentTime;
const getServerSnapshot = () => 0;

export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
