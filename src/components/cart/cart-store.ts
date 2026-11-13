"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  price: number; // paise, display only. The server re-prices at checkout.
  image: string | null;
  category: string;
  qty: number;
  stock: number;
};

type CartState = {
  lines: CartLine[];
  open: boolean;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      add: (line, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.productId === line.productId);
          if (existing) {
            return {
              open: true,
              lines: s.lines.map((l) =>
                l.productId === line.productId ? { ...l, ...line, qty: Math.min(l.qty + qty, line.stock) } : l,
              ),
            };
          }
          return { open: true, lines: [...s.lines, { ...line, qty: Math.min(qty, line.stock) }] };
        }),
      setQty: (productId, qty) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.productId === productId ? { ...l, qty: Math.max(0, Math.min(qty, l.stock)) } : l))
            .filter((l) => l.qty > 0),
        })),
      remove: (productId) => set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
      setOpen: (open) => set({ open }),
    }),
    { name: "hmx-cart", partialize: (s) => ({ lines: s.lines }) },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty * l.price, 0);
