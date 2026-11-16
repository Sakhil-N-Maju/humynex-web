"use client";

import { useEffect } from "react";
import { useCart, type CartLine } from "./cart-store";
import { loadCart, saveCart } from "@/app/actions/cart";

// The first load of a page (which may merge a signed-out cart into the
// account) is shared, so it runs once even if the effect mounts twice.
let firstLoad: ReturnType<typeof loadCart> | null = null;

const sig = (lines: CartLine[]) => JSON.stringify(lines.map((l) => [l.productId, l.qty]));
const plain = (lines: CartLine[]) => lines.map((l) => ({ productId: l.productId, qty: l.qty }));

/**
 * Keeps a signed-in customer's cart in the database so it follows them across
 * devices. The account's saved cart is the source of truth; this browser keeps
 * a copy. Items added while signed out are merged in on sign-in. Signing out
 * empties this browser's copy (the account keeps it).
 */
export function CartSync() {
  useEffect(() => {
    let alive = true;
    let owner: string | null = null; // signed-in account, once known
    let synced = ""; // what the server has, to skip no-op saves
    let timer: ReturnType<typeof setTimeout> | undefined;
    let saving: Promise<unknown> = Promise.resolve();

    const pull = async (mergeGuest: boolean) => {
      let req: ReturnType<typeof loadCart>;
      if (mergeGuest) {
        const s = useCart.getState();
        // shared only while in flight, so a later mount gets fresh data
        firstLoad ??= loadCart(!s.owner ? plain(s.lines) : undefined).finally(() => {
          firstLoad = null;
        });
        req = firstLoad;
      } else req = loadCart();
      const res = await req.catch(() => null);
      if (!alive || !res) return;
      if (!res.ok) {
        // signed out: drop the copy of the last account's cart
        owner = null;
        if (useCart.getState().owner) useCart.getState().load([], null);
        return;
      }
      owner = res.userId;
      synced = sig(res.lines);
      useCart.getState().load(res.lines, res.userId);
    };

    const push = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const lines = useCart.getState().lines;
        const now = sig(lines);
        if (!owner || now === synced) return;
        synced = now;
        saving = saveCart(plain(lines)).catch(() => null);
      }, 400);
    };

    const start = async () => {
      await pull(true);
      if (!alive) return;
      // later changes on this device go to the server
      unsub = useCart.subscribe((s, prev) => {
        if (owner && s.lines !== prev.lines) push();
      });
    };

    // another device may have changed the cart while this tab was in the background
    const onVisible = async () => {
      if (document.visibilityState !== "visible" || !owner) return;
      await saving;
      if (sig(useCart.getState().lines) !== synced) return; // an edit here is still on its way
      await pull(false);
    };

    let unsub = () => {};
    const hydrated = useCart.persist.hasHydrated();
    const stopHydrate = hydrated ? () => {} : useCart.persist.onFinishHydration(() => start());
    if (hydrated) start();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      alive = false;
      clearTimeout(timer);
      unsub();
      stopHydrate();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
