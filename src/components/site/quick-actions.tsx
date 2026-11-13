"use client";

import { CartDrawer } from "@/components/cart/cart-drawer";

/** Mounts the cart drawer once per page; the dock opens it. */
export function QuickActions() {
  return <CartDrawer />;
}
