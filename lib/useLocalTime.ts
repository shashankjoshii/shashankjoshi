"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/lib/content";

function subscribe(cb: () => void) {
  const id = setInterval(cb, 10_000);
  return () => clearInterval(id);
}

const read = () =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: site.timezone,
  }).format(new Date());

/** Current time in the site's timezone. Empty string during SSR/hydration. */
export function useLocalTime() {
  return useSyncExternalStore(subscribe, read, () => "");
}
