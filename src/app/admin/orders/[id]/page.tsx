import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { setOrderStatus, setOrderTracking } from "../../actions";
import { Flash, Status, SubmitButton } from "@/components/admin/ui";

const NEXT: Record<string, string[]> = {
  PENDING_PAYMENT: ["CANCELLED"],
  PAID: ["PACKED", "SHIPPED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default async function AdminOrder({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const o = await db.order.findUnique({ where: { id }, include: { items: true, user: true } });
  if (!o) notFound();
  const payments = await db.payment.findMany({ where: { kind: "ORDER", refId: o.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-[1000px]">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-fg-2 hover:text-[#1E90FF]"><ArrowLeft size={14} /> Orders</Link>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <h1 className="display font-mono text-3xl">{o.number}</h1>
        <Status value={o.status} />
      </div>
      <p className="mt-1 text-sm text-fg-3">Placed {o.createdAt.toLocaleString("en-IN")}</p>
      <div className="mt-6"><Flash sp={sp} /></div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="surface p-5">
          <h2 className="font-semibold">Items</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {o.items.map((i) => (
              <li key={i.id} className="flex justify-between py-2.5"><span>{i.qty} x {i.name}</span><span className="font-mono">{formatINR(i.qty * i.price)}</span></li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-[#050816]/10 pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-fg-2">Subtotal</dt><dd className="font-mono">{formatINR(o.subtotal)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between"><dt className="text-fg-2">Offer {o.couponCode}</dt><dd className="font-mono">- {formatINR(o.discount)}</dd></div>}
            {o.pointsUsed > 0 && <div className="flex justify-between"><dt className="text-fg-2">Points used</dt><dd className="font-mono">- {formatINR(o.pointsUsed * 100)}</dd></div>}
            <div className="flex justify-between"><dt className="text-fg-2">Shipping</dt><dd className="font-mono">{formatINR(o.shipping)}</dd></div>
            <div className="flex justify-between pt-1 text-base font-semibold"><dt>Total</dt><dd className="font-mono">{formatINR(o.total)}</dd></div>
          </dl>
        </section>
        <section className="space-y-6">
          <div className="surface p-5 text-sm">
            <h2 className="font-semibold">Ship to</h2>
            <address className="mt-2 not-italic leading-relaxed text-fg-2">
              {o.name}<br />{o.line1}{o.line2 ? <><br />{o.line2}</> : null}<br />{o.city}, {o.state} {o.postal}
            </address>
            <p className="mt-3"><a href={`tel:${o.phone}`} className="text-[#1E90FF]">{o.phone}</a><br /><a href={`mailto:${o.email}`} className="text-[#1E90FF]">{o.email}</a></p>
            {o.user && <p className="mt-3 text-xs text-fg-3">Member account, earned {o.pointsEarned} points</p>}
          </div>
          {NEXT[o.status]?.length > 0 && (
            <form action={setOrderStatus} className="surface flex items-end gap-3 p-5">
              <input type="hidden" name="id" value={o.id} />
              <div className="flex-1">
                <label htmlFor="status" className="mb-2 block text-sm font-medium">Move to</label>
                <select id="status" name="status" className="input h-10">
                  {NEXT[o.status].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>)}
                </select>
              </div>
              <SubmitButton>Update</SubmitButton>
            </form>
          )}
          <form action={setOrderTracking} className="surface p-5">
            <input type="hidden" name="id" value={o.id} />
            <label htmlFor="trackingUrl" className="mb-2 block text-sm font-medium">Tracking link</label>
            <div className="flex gap-2">
              <input
                id="trackingUrl"
                name="trackingUrl"
                type="url"
                inputMode="url"
                defaultValue={o.trackingUrl ?? ""}
                placeholder="https://courier.example/track/123456"
                className="input h-10 min-w-0 flex-1"
              />
              <SubmitButton>Save</SubmitButton>
            </div>
            <p className="mt-2 text-xs text-fg-3">
              {o.trackingUrl ? (
                <>The customer sees a Track button on this order. <a href={o.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-[#1E90FF] hover:underline">Open link</a></>
              ) : (
                "Paste the courier's tracking link. The customer gets a Track button on this order in their account. Clear it to remove."
              )}
            </p>
          </form>
          <p className="text-xs text-fg-3">Cancelling returns any points the customer used and puts paid stock back. Refund the money itself from the Razorpay dashboard.</p>
          <div className="text-sm">
            <h2 className="font-semibold">Payments</h2>
            <ul className="mt-2 space-y-1 font-mono text-xs text-fg-2">
              {payments.length === 0 && <li className="font-sans text-fg-3">No payment attempts yet.</li>}
              {payments.map((p) => (
                <li key={p.id}>{p.provider} {p.providerPaymentId ?? p.providerOrderId} <span className={p.status === "PAID" ? "text-ok" : p.status === "FAILED" ? "text-bad" : ""}>{p.status}</span></li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
