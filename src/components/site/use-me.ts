"use client";

import { useSyncExternalStore } from "react";

export type ChromeUser = { name: string; points: number; isAdmin: boolean } | null;

// One fetch per page load, shared by every component that asks.
let me: ChromeUser = null;
let started = false;
const subs = new Set<() => void>();

function load() {
  if (started) return;
  started = true;
  fetch("/api/me", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : { user: null }))
    .then((d: { user: ChromeUser }) => {
      me = d.user;
      subs.forEach((cb) => cb());
    })
    .catch(() => {});
}

/** The signed-in visitor, or null (also while loading and on the server). */
export function useMe(): ChromeUser {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      load();
      return () => subs.delete(cb);
    },
    () => me,
    () => null,
  );
}
