"use client";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartSync } from "@/components/cart/cart-sync";

/** Mounts the cart drawer once per page (the dock opens it) and keeps the cart in sync with the account. */
export function QuickActions() {
  return (
    <>
      <CartDrawer />
      <CartSync />
    </>
  );
}
