import { NextResponse } from "next/server";
import { fulfilPayment, markPaymentFailed, verifyWebhookSignature } from "@/lib/payments";

/**
 * Razorpay webhook. Configure in the Razorpay dashboard:
 *   URL:    https://<your-domain>/api/payments/webhook
 *   Secret: same value as RAZORPAY_WEBHOOK_SECRET
 *   Events: payment.captured, order.paid, payment.failed
 * This is the safety net if a customer closes the tab before the browser
 * confirms the payment.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, sig)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }
  const event = JSON.parse(raw) as {
    event: string;
    payload: { payment?: { entity: { id: string; order_id: string } }; order?: { entity: { id: string } } };
  };
  const payment = event.payload.payment?.entity;
  try {
    if ((event.event === "payment.captured" || event.event === "order.paid") && payment?.order_id) {
      await fulfilPayment(payment.order_id, payment.id);
    } else if (event.event === "payment.failed" && payment?.order_id) {
      await markPaymentFailed(payment.order_id);
    }
  } catch (e) {
    // unknown order ids (e.g. payments made outside this site) are acknowledged, not retried
    console.error("Webhook handling error", e);
  }
  return NextResponse.json({ received: true });
}
