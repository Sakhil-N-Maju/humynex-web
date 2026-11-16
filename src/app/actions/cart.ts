"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import type { CartLine } from "@/components/cart/cart-store";

const linesSchema = z
  .array(z.object({ productId: z.string().min(1).max(64), qty: z.number().int().min(1).max(99) }))
  .max(60);

export type CartSync = { ok: true; userId: string; lines: CartLine[] } | { ok: false };

/** The account's cart with current product details; unavailable products dropped. */
async function read(userId: string): Promise<CartLine[]> {
  const rows = await db.cartItem.findMany({
    where: { userId },
    orderBy: { updatedAt: "asc" },
    include: { product: true },
  });
  return rows
    .filter((r) => r.product.active && r.product.stock > 0)
    .map((r) => ({
      productId: r.productId,
      slug: r.product.slug,
      name: r.product.name,
      price: r.product.price,
      image: r.product.image,
      category: r.product.category,
      stock: r.product.stock,
      qty: Math.min(r.qty, r.product.stock),
    }));
}

/**
 * Loads the signed-in customer's cart. Pass `guest` for items added while
 * signed out: they're merged into the account cart (quantities added, up to stock).
 */
export async function loadCart(guest?: { productId: string; qty: number }[]): Promise<CartSync> {
  const user = await getUser();
  if (!user) return { ok: false };
  const add = linesSchema.safeParse(guest ?? []);
  if (add.success && add.data.length) {
    const products = await db.product.findMany({
      where: { id: { in: add.data.map((l) => l.productId) }, active: true },
      select: { id: true, stock: true },
    });
    const existing = await db.cartItem.findMany({ where: { userId: user.id } });
    for (const l of add.data) {
      const p = products.find((x) => x.id === l.productId);
      if (!p || p.stock <= 0) continue;
      const had = existing.find((e) => e.productId === l.productId)?.qty ?? 0;
      const qty = Math.min(had + l.qty, p.stock, 99);
      await db.cartItem.upsert({
        where: { userId_productId: { userId: user.id, productId: l.productId } },
        create: { userId: user.id, productId: l.productId, qty },
        update: { qty },
      });
    }
  }
  return { ok: true, userId: user.id, lines: await read(user.id) };
}

/** Replaces the signed-in customer's saved cart with these lines. */
export async function saveCart(lines: { productId: string; qty: number }[]): Promise<{ ok: boolean }> {
  const user = await getUser();
  if (!user) return { ok: false };
  const parsed = linesSchema.safeParse(lines);
  if (!parsed.success) return { ok: false };
  const ids = parsed.data.map((l) => l.productId);
  const valid = new Set((await db.product.findMany({ where: { id: { in: ids } }, select: { id: true } })).map((p) => p.id));
  const keep = parsed.data.filter((l) => valid.has(l.productId));
  try {
    await db.cartItem.deleteMany({ where: { userId: user.id, productId: { notIn: keep.map((l) => l.productId) } } });
    for (const l of keep) {
      await db.cartItem.upsert({
        where: { userId_productId: { userId: user.id, productId: l.productId } },
        create: { userId: user.id, productId: l.productId, qty: l.qty },
        update: { qty: l.qty },
      });
    }
    return { ok: true };
  } catch (e) {
    console.error("[cart] save", e instanceof Error ? e.message : e);
    return { ok: false };
  }
}
