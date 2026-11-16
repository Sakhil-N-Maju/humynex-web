"use server";

import { z } from "zod";
import {
  createPaymentIntent,
  fulfilPayment,
  markPaymentFailed,
  testModeAllowed,
  verifyCheckoutSignature,
  type PayKind,
  type PaymentIntent,
} from "@/lib/payments";
import { db } from "@/lib/db";
import { publicMessage } from "@/lib/errors";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const kindSchema = z.enum(["ORDER", "RENTAL", "PRINT"]);

export async function startPayment(kind: PayKind, refId: string): Promise<Result<PaymentIntent>> {
  try {
    const k = kindSchema.parse(kind);
    return { ok: true, data: await createPaymentIntent(k, z.string().min(1).parse(refId)) };
  } catch (e) {
    return { ok: false, error: publicMessage(e, "Couldn't start the payment. Please try again, or contact us.", "payment") };
  }
}

export async function confirmRazorpay(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<Result<{ kind: PayKind; refId: string }>> {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;
  if (!verifyCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return { ok: false, error: "We couldn't verify that payment. If money was debited, contact us with your reference." };
  }
  const res = await fulfilPayment(razorpay_order_id, razorpay_payment_id);
  return { ok: true, data: { kind: res.kind, refId: res.refId } };
}

/** Only usable when Razorpay keys are absent and the app isn't a production build. */
export async function confirmTestPayment(
  providerOrderId: string,
  outcome: "success" | "failure",
): Promise<Result<{ kind: PayKind; refId: string }>> {
  if (!testModeAllowed()) return { ok: false, error: "Test payments are disabled." };
  const pay = await db.payment.findUnique({ where: { providerOrderId } });
  if (!pay || pay.provider !== "test") return { ok: false, error: "Unknown test payment." };
  if (outcome === "failure") {
    await markPaymentFailed(providerOrderId);
    return { ok: false, error: "Test payment declined. Nothing was charged, and you can try again." };
  }
  const res = await fulfilPayment(providerOrderId, `test_pay_${Date.now()}`);
  return { ok: true, data: { kind: res.kind, refId: res.refId } };
}

export async function reportPaymentFailed(providerOrderId: string) {
  await markPaymentFailed(providerOrderId);
}
