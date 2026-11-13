"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, Minus, Plus, ShoppingBagOpen } from "@phosphor-icons/react";
import { useCart } from "./cart-store";

type P = { id: string; slug: string; name: string; price: number; image: string | null; category: string; stock: number };

export function AddToCart({ product, compact = false }: { product: P; compact?: boolean }) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const out = product.stock <= 0;

  const go = () => {
    add({ productId: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image, category: product.category, stock: product.stock }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  if (compact) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          go();
        }}
        disabled={out}
        aria-label={out ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
        className="grid size-11 shrink-0 place-items-center rounded-full bg-[#050816] text-white transition-colors hover:bg-[#1E90FF] hover:text-[#050816] disabled:opacity-35"
      >
        {added ? <Check size={18} weight="bold" /> : <ShoppingBagOpen size={18} />}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex h-12 items-center rounded-full border border-[#050816]/20 text-[#050816]">
        <button className="grid h-full w-11 place-items-center hover:text-[#1E90FF] disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">
          <Minus size={16} />
        </button>
        <span className="w-10 text-center font-mono" aria-live="polite">{qty}</span>
        <button className="grid h-full w-11 place-items-center hover:text-[#1E90FF] disabled:opacity-30" onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={qty >= product.stock} aria-label="Increase quantity">
          <Plus size={16} />
        </button>
      </div>
      <motion.button whileTap={{ scale: 0.97 }} onClick={go} disabled={out} className="inline-flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-full bg-[#1E90FF] px-6 font-semibold text-[#050816] transition-colors hover:bg-[#67D4FF] disabled:opacity-45">
        {out ? "Out of stock" : added ? (<><Check size={18} weight="bold" /> Added</>) : "Add to cart"}
      </motion.button>
    </div>
  );
}
