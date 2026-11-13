"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** false during SSR and hydration, true afterwards. No effect, no extra render pass. */
export function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** Live media-query match, false on the server. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** A localStorage flag that stays in sync across components and tabs. */
export function useStoredFlag(key: string, event: string, fallback: string) {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(event, cb);
      window.addEventListener("storage", cb);
      return () => {
        window.removeEventListener(event, cb);
        window.removeEventListener("storage", cb);
      };
    },
    () => {
      try {
        return localStorage.getItem(key) ?? fallback;
      } catch {
        return fallback;
      }
    },
    () => null,
  );
}
