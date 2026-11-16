import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowSquareOut, Package } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatINR } from "@/lib/money";
import { PayNow } from "../../pay-now";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

const STEPS = ["PAID", "PACKED", "SHIPPED", "DELIVERED"] as const;
const LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/account/orders/${id}`);
  // only the customer's own orders
  const o = await db.order.findFirst({ where: { id, userId: user.id }, include: { items: true } });
  if (!o) notFound();
  const reached = STEPS.indexOf(o.status as (typeof STEPS)[number]);

  return (
    <div className="mx-auto max-w-[900px] px-4 pt-12 md:px-8">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm text-fg-2 hover:text-volt-hi">
        <ArrowLeft size={14} /> Your account
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-wide font-mono text-3xl md:text-4xl">{o.number}</h1>
          <p className="mt-1 text-sm text-fg-2">
            Placed {o.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} / {LABEL[o.status] ?? o.status}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {o.status === "PENDING_PAYMENT" && <PayNow kind="ORDER" id={o.id} />}
          {o.trackingUrl && o.status !== "CANCELLED" && (
            <a href={o.trackingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              <Package size={16} /> Track your parcel <ArrowSquareOut size={14} />
            </a>
          )}
        </div>
      </div>

      <div className="admin-light mt-8 space-y-6 rounded-[28px] bg-white p-6 text-[#050816] md:p-8">
        {o.status !== "CANCELLED" && o.status !== "PENDING_PAYMENT" && (
          <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
            {STEPS.map((s, i) => (
              <li key={s} className="text-center">
                <span className={`block h-1.5 rounded-full ${i <= reached ? "bg-[#1E90FF]" : "bg-[#050816]/10"}`} />
                <span className={`mt-2 block text-xs ${i <= reached ? "font-medium text-[#050816]" : "text-fg-3"}`}>{LABEL[s]}</span>
              </li>
            ))}
          </ol>
        )}
        {o.status === "SHIPPED" && !o.trackingUrl && <p className="text-sm text-fg-2">Your parcel is on its way. The tracking link will appear here soon.</p>}

        <section>
          <h2 className="font-semibold">Items</h2>
          <ul className="mt-3 divide-y divide-[#050816]/10 text-sm">
            {o.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-3">
                <span>{i.qty} x {i.name}</span>
                <span className="font-mono">{formatINR(i.qty * i.price)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-1.5 border-t border-[#050816]/10 pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-fg-2">Subtotal</dt><dd className="font-mono">{formatINR(o.subtotal)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between"><dt className="text-fg-2">Offer {o.couponCode}</dt><dd className="font-mono">- {formatINR(o.discount)}</dd></div>}
            {o.pointsUsed > 0 && <div className="flex justify-between"><dt className="text-fg-2">Points</dt><dd className="font-mono">- {formatINR(o.pointsUsed * 100)}</dd></div>}
            <div className="flex justify-between"><dt className="text-fg-2">Shipping</dt><dd className="font-mono">{o.shipping ? formatINR(o.shipping) : "Free"}</dd></div>
            <div className="flex justify-between pt-1 text-base font-semibold"><dt>Total</dt><dd className="font-mono">{formatINR(o.total)}</dd></div>
          </dl>
          {o.pointsEarned > 0 && <p className="mt-3 text-sm text-ok">You earned {o.pointsEarned} points on this order.</p>}
        </section>

        <section className="border-t border-[#050816]/10 pt-6 text-sm">
          <h2 className="font-semibold">Delivering to</h2>
          <address className="mt-2 not-italic leading-relaxed text-fg-2">
            {o.name}
            <br />
            {o.line1}
            {o.line2 ? <><br />{o.line2}</> : null}
            <br />
            {o.city}, {o.state} {o.postal}
            <br />
            {o.phone}
          </address>
        </section>
      </div>

      <p className="mt-6 text-sm text-fg-2">
        Questions about this order? <Link href="/contact" className="text-volt-hi hover:underline">Contact us</Link> with your order number.
      </p>
    </div>
  );
}
