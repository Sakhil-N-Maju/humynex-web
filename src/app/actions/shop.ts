"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { evaluateCoupon, type CouponScope } from "@/lib/coupons";
import { maxRedeemable } from "@/lib/rewards";
import { getSetting } from "@/lib/settings";
import { refNumber } from "@/lib/ids";
import { publicMessage } from "@/lib/errors";

export async function previewCoupon(code: string, scope: CouponScope, amount: number) {
  const user = await getUser();
  return evaluateCoupon(code, scope, Math.max(0, Math.round(amount)), !!user);
}

const lineSchema = z.object({ productId: z.string().min(1), qty: z.number().int().min(1).max(99) });
const addressSchema = z.object({
  name: z.string().trim().min(2, "Enter the recipient's name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,15}$/, "Enter a valid phone number."),
  line1: z.string().trim().min(4, "Enter the street address."),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "Enter the city."),
  state: z.string().trim().min(2, "Enter the state."),
  postal: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit PIN code."),
});

export type CheckoutInput = {
  lines: { productId: string; qty: number }[];
  address: z.infer<typeof addressSchema>;
  coupon?: string;
  usePoints?: boolean;
  /** signed-in buyers: store this phone and address on their account */
  saveDetails?: boolean;
};

export type Totals = {
  subtotal: number;
  discount: number;
  pointsUsed: number;
  shipping: number;
  total: number;
  couponTitle?: string;
  couponError?: string;
  maxPoints: number;
  unavailable: string[];
};

/** Prices the cart on the server. Used both for the live summary and the real order. */
async function priceCart(lines: { productId: string; qty: number }[], coupon: string | undefined, usePoints: boolean) {
  const user = await getUser();
  const products = await db.product.findMany({ where: { id: { in: lines.map((l) => l.productId) }, active: true } });
  const byId = new Map(products.map((p) => [p.id, p]));
  const unavailable: string[] = [];
  const priced = lines.flatMap((l) => {
    const p = byId.get(l.productId);
    if (!p) {
      unavailable.push("An item is no longer available");
      return [];
    }
    if (p.stock < l.qty) unavailable.push(p.stock > 0 ? `Only ${p.stock} of ${p.name} left` : `${p.name} is out of stock`);
    return [{ product: p, qty: Math.min(l.qty, Math.max(p.stock, 0)) }];
  });
  const subtotal = priced.reduce((n, l) => n + l.product.price * l.qty, 0);

  let discount = 0;
  let couponTitle: string | undefined;
  let couponError: string | undefined;
  let couponCode: string | undefined;
  if (coupon?.trim()) {
    const res = await evaluateCoupon(coupon, "SHOP", subtotal, !!user);
    if (res.ok) {
      discount = res.discount;
      couponTitle = res.title;
      couponCode = res.code;
    } else couponError = res.error;
  }

  const shippingCfg = await getSetting("shipping");
  const shipping = subtotal - discount >= shippingCfg.freeAbove || subtotal === 0 ? 0 : shippingCfg.flat;
  const maxPoints = user ? await maxRedeemable(user.points, subtotal - discount) : 0;
  const pointsUsed = usePoints ? maxPoints : 0;
  const total = Math.max(0, subtotal - discount - pointsUsed * 100 + shipping);

  return { user, priced, subtotal, discount, couponTitle, couponError, couponCode, shipping, maxPoints, pointsUsed, total, unavailable };
}

export async function quoteCart(lines: { productId: string; qty: number }[], coupon?: string, usePoints?: boolean): Promise<Totals> {
  const safe = z.array(lineSchema).max(50).parse(lines);
  const r = await priceCart(safe, coupon, !!usePoints);
  return {
    subtotal: r.subtotal,
    discount: r.discount,
    pointsUsed: r.pointsUsed,
    shipping: r.shipping,
    total: r.total,
    couponTitle: r.couponTitle,
    couponError: r.couponError,
    maxPoints: r.maxPoints,
    unavailable: r.unavailable,
  };
}

export async function createOrder(
  input: CheckoutInput,
): Promise<{ ok: true; orderId: string } | { ok: false; error?: string; fieldErrors?: Record<string, string> }> {
  const lines = z.array(lineSchema).min(1, "Your cart is empty.").max(50).safeParse(input.lines);
  if (!lines.success) return { ok: false, error: lines.error.issues[0].message };
  const addr = addressSchema.safeParse(input.address);
  if (!addr.success) {
    return { ok: false, fieldErrors: Object.fromEntries(addr.error.issues.map((i) => [String(i.path[0]), i.message])) };
  }

  const r = await priceCart(lines.data, input.coupon, !!input.usePoints);
  if (r.unavailable.length) return { ok: false, error: `${r.unavailable.join(". ")}. Please update your cart.` };
  if (input.coupon?.trim() && r.couponError) return { ok: false, error: r.couponError };
  if (r.total < 100) return { ok: false, error: "Order total is too low to process." };

  let order;
  try {
    order = await db.$transaction(async (tx) => {
    if (r.user && r.pointsUsed > 0) {
      const fresh = await tx.user.findUniqueOrThrow({ where: { id: r.user.id } });
      if (fresh.points < r.pointsUsed) throw new Error("Your points balance changed. Please review your order.");
    }
    const o = await tx.order.create({
      data: {
        number: refNumber("HMX"),
        userId: r.user?.id ?? null,
        ...addr.data,
        line2: addr.data.line2 || null,
        subtotal: r.subtotal,
        discount: r.discount,
        pointsUsed: r.pointsUsed,
        shipping: r.shipping,
        total: r.total,
        couponCode: r.couponCode ?? null,
        items: {
          create: r.priced.map((l) => ({ productId: l.product.id, name: l.product.name, price: l.product.price, qty: l.qty })),
        },
      },
    });
    if (r.user && r.pointsUsed > 0) {
      await tx.user.update({ where: { id: r.user.id }, data: { points: { decrement: r.pointsUsed } } });
      await tx.pointsEntry.create({
        data: { userId: r.user.id, delta: -r.pointsUsed, reason: "REDEEM", refType: "ORDER", refId: o.id, note: `Used on order ${o.number}` },
      });
    }
    return o;
    });
  } catch (e) {
    return { ok: false, error: publicMessage(e, "Couldn't place your order. Please try again, or contact us.", "checkout") };
  }

  // remember the buyer's phone and address; a failure here never blocks the order
  if (r.user && input.saveDetails) {
    const a = addr.data;
    await db.user
      .update({
        where: { id: r.user.id },
        data: { phone: a.phone, addrLine1: a.line1, addrLine2: a.line2 || null, addrCity: a.city, addrState: a.state, addrPostal: a.postal },
      })
      .catch((e) => console.error("[checkout] save details", e instanceof Error ? e.message : e));
  }

  return { ok: true, orderId: order.id };
}
