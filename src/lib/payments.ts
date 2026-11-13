import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "./db";
import { awardPurchase } from "./rewards";

export type PayKind = "ORDER" | "RENTAL" | "PRINT";

export function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/**
 * Test payments exist so the full flow can be exercised before Razorpay keys
 * are added. They are refused in production builds, always.
 */
export function testModeAllowed() {
  return !razorpayConfigured() && process.env.NODE_ENV !== "production";
}

export type PaymentIntent = {
  provider: "razorpay" | "test";
  keyId?: string;
  providerOrderId: string;
  amount: number;
  currency: "INR";
  description: string;
  prefill: { name: string; email: string; contact: string };
  reference: string;
};

async function loadPayable(kind: PayKind, refId: string) {
  if (kind === "ORDER") {
    const o = await db.order.findUnique({ where: { id: refId } });
    if (!o) return null;
    return { status: o.status, amount: o.total, number: o.number, name: o.name, email: o.email, phone: o.phone, label: `Order ${o.number}` };
  }
  if (kind === "RENTAL") {
    const b = await db.rentalBooking.findUnique({ where: { id: refId }, include: { item: true } });
    if (!b) return null;
    return { status: b.status, amount: b.total, number: b.number, name: b.name, email: b.email, phone: b.phone, label: `${b.item.name} rental ${b.number}` };
  }
  const p = await db.printJob.findUnique({ where: { id: refId } });
  if (!p) return null;
  const status = p.status === "QUOTED" ? "PENDING_PAYMENT" : p.status;
  return { status, amount: p.estimate, number: p.number, name: p.name, email: p.email, phone: p.phone, label: `3D print ${p.number}` };
}

export async function createPaymentIntent(kind: PayKind, refId: string): Promise<PaymentIntent> {
  const item = await loadPayable(kind, refId);
  if (!item) throw new Error("We couldn't find that order.");
  if (item.status !== "PENDING_PAYMENT") throw new Error("This has already been paid or was cancelled.");
  if (item.amount < 100) throw new Error("Amount is too small to charge.");

  let providerOrderId: string;
  let provider: "razorpay" | "test";

  if (razorpayConfigured()) {
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        amount: item.amount,
        currency: "INR",
        receipt: item.number,
        notes: { kind, refId },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("Razorpay order creation failed", res.status, body);
      throw new Error("The payment gateway is unavailable. Please try again in a minute.");
    }
    const data = (await res.json()) as { id: string };
    providerOrderId = data.id;
    provider = "razorpay";
  } else if (testModeAllowed()) {
    providerOrderId = `test_${randomBytes(8).toString("hex")}`;
    provider = "test";
  } else {
    throw new Error("Online payments are not configured yet. Please contact us to complete this order.");
  }

  await db.payment.create({
    data: { kind, refId, amount: item.amount, provider, providerOrderId },
  });

  return {
    provider,
    keyId: provider === "razorpay" ? process.env.RAZORPAY_KEY_ID : undefined,
    providerOrderId,
    amount: item.amount,
    currency: "INR",
    description: item.label,
    prefill: { name: item.name, email: item.email, contact: item.phone },
    reference: item.number,
  };
}

function safeEqualHex(a: string, b: string) {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Marks a payment as paid and fulfils whatever it was for. Idempotent. */
export async function fulfilPayment(providerOrderId: string, providerPaymentId: string) {
  return db.$transaction(async (tx) => {
    const pay = await tx.payment.findUnique({ where: { providerOrderId } });
    if (!pay) throw new Error("Unknown payment.");
    if (pay.status === "PAID") return { kind: pay.kind as PayKind, refId: pay.refId, already: true };

    await tx.payment.update({
      where: { id: pay.id },
      data: { status: "PAID", providerPaymentId },
    });

    if (pay.kind === "ORDER") {
      const order = await tx.order.findUniqueOrThrow({ where: { id: pay.refId }, include: { items: true } });
      if (order.status === "PENDING_PAYMENT") {
        for (const it of order.items) {
          await tx.product.update({ where: { id: it.productId }, data: { stock: { decrement: it.qty } } });
        }
        if (order.couponCode) {
          await tx.coupon.update({ where: { code: order.couponCode }, data: { usedCount: { increment: 1 } } }).catch(() => null);
        }
        const earned = await awardPurchase(tx, order.userId, order.total, "ORDER", order.id, `Order ${order.number}`);
        await tx.order.update({ where: { id: order.id }, data: { status: "PAID", pointsEarned: earned } });
      }
    } else if (pay.kind === "RENTAL") {
      const b = await tx.rentalBooking.findUniqueOrThrow({ where: { id: pay.refId }, include: { item: true } });
      if (b.status === "PENDING_PAYMENT") {
        if (b.couponCode) {
          await tx.coupon.update({ where: { code: b.couponCode }, data: { usedCount: { increment: 1 } } }).catch(() => null);
        }
        // points are earned on the rent, not on the refundable deposit
        await awardPurchase(tx, b.userId, b.rentTotal - b.discount, "RENTAL", b.id, `${b.item.name} rental`);
        await tx.rentalBooking.update({ where: { id: b.id }, data: { status: "CONFIRMED" } });
      }
    } else {
      const p = await tx.printJob.findUniqueOrThrow({ where: { id: pay.refId } });
      if (p.status === "PENDING_PAYMENT" || p.status === "QUOTED") {
        await awardPurchase(tx, p.userId, p.estimate, "PRINT", p.id, `3D print ${p.number}`);
        await tx.printJob.update({ where: { id: p.id }, data: { status: "PAID" } });
      }
    }
    return { kind: pay.kind as PayKind, refId: pay.refId, already: false };
  });
}

export async function markPaymentFailed(providerOrderId: string) {
  await db.payment.updateMany({
    where: { providerOrderId, status: "CREATED" },
    data: { status: "FAILED" },
  });
}
