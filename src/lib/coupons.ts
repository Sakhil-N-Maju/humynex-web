import "server-only";
import { db } from "./db";
import { formatINR } from "./money";

export type CouponScope = "SHOP" | "RENTAL" | "PRINT";

export type CouponResult =
  | { ok: true; code: string; discount: number; title: string }
  | { ok: false; error: string };

export async function evaluateCoupon(
  rawCode: string,
  scope: CouponScope,
  amountPaise: number,
  isMember: boolean,
): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a code." };
  const c = await db.coupon.findUnique({ where: { code } });
  const now = new Date();
  if (!c || !c.active) return { ok: false, error: "That code isn't valid." };
  if (c.startsAt && c.startsAt > now) return { ok: false, error: "That offer hasn't started yet." };
  if (c.endsAt && c.endsAt < now) return { ok: false, error: "That offer has ended." };
  if (c.usageLimit !== null && c.usedCount >= c.usageLimit)
    return { ok: false, error: "That code has been fully redeemed." };
  if (c.appliesTo !== "ALL" && c.appliesTo !== scope)
    return { ok: false, error: `This code only works on ${c.appliesTo.toLowerCase()} orders.` };
  if (c.membersOnly && !isMember) return { ok: false, error: "Sign in to use this members-only code." };
  if (amountPaise < c.minOrder)
    return { ok: false, error: `Add ${formatINR(c.minOrder - amountPaise)} more to use this code.` };

  let discount = c.type === "PERCENT" ? Math.round((amountPaise * c.value) / 100) : c.value;
  if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
  discount = Math.min(discount, amountPaise);
  return { ok: true, code: c.code, discount, title: c.title };
}
