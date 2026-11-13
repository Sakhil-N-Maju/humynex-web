"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-store";

export function ClearCart() {
  const clear = useCart((s) => s.clear);
  useEffect(() => clear(), [clear]);
  return null;
}
