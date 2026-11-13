"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, Trash, X } from "@phosphor-icons/react";
import { useCart, cartSubtotal } from "./cart-store";
import { Plate } from "@/components/ui/plate";
import { formatINR } from "@/lib/money";

export function CartDrawer() {
  const { lines, open, setOpen, setQty, remove } = useCart();
  const subtotal = cartSubtotal(lines);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-label="Cart"
            aria-modal="true"
            data-lenis-prevent
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col border-l border-line bg-ink-2"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="display text-xl">Your cart</h2>
              <button onClick={() => setOpen(false)} aria-label="Close cart" className="text-fg-2 hover:text-fg">
                <X size={22} />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-start justify-center gap-4 px-6">
                <p className="display text-2xl">Nothing here yet.</p>
                <p className="text-fg-2">Boards, sensors, motors and kits ship from Kalady within two working days.</p>
                <Link href="/shop" onClick={() => setOpen(false)} className="btn btn-primary mt-2">
                  Browse parts
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto px-6">
                  <AnimatePresence initial={false}>
                    {lines.map((l) => (
                      <motion.li
                        key={l.productId}
                        layout
                        exit={{ opacity: 0, x: 40 }}
                        className="flex gap-4 border-b border-line py-5"
                      >
                        <Plate src={l.image} alt={l.name} kind={l.category} className="size-20 shrink-0" sizes="80px" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <Link href={`/shop/${l.slug}`} onClick={() => setOpen(false)} className="truncate font-medium hover:text-volt-hi">
                            {l.name}
                          </Link>
                          <span className="font-mono text-sm text-fg-2">{formatINR(l.price)}</span>
                          <div className="mt-auto flex items-center gap-3 pt-2">
                            <div className="flex items-center rounded-[4px] border border-line-2">
                              <button className="grid size-8 place-items-center hover:text-volt-hi" aria-label="Decrease" onClick={() => setQty(l.productId, l.qty - 1)}>
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center font-mono text-sm" aria-live="polite">{l.qty}</span>
                              <button
                                className="grid size-8 place-items-center hover:text-volt-hi disabled:opacity-30"
                                aria-label="Increase"
                                disabled={l.qty >= l.stock}
                                onClick={() => setQty(l.productId, l.qty + 1)}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button className="text-fg-3 hover:text-bad" aria-label={`Remove ${l.name}`} onClick={() => remove(l.productId)}>
                              <Trash size={18} />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="space-y-4 border-t border-line px-6 py-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-fg-2">Subtotal</span>
                    <span className="font-mono text-lg">{formatINR(subtotal)}</span>
                  </div>
                  <p className="text-sm text-fg-3">Shipping, offers and reward points are applied at checkout.</p>
                  <Link href="/checkout" onClick={() => setOpen(false)} className="btn btn-primary w-full">
                    Checkout
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
