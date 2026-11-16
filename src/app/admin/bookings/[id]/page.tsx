import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, WhatsappLogo, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { approveBooking, declineBooking, setBookingStatus } from "../../actions";
import { Flash, Status, SubmitButton, F } from "@/components/admin/ui";

const fmt = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const rupees = (p: number) => (p / 100).toFixed(p % 100 ? 2 : 0);

// where a booking can go next, after review
const NEXT: Record<string, string[]> = {
  APPROVED: ["CONFIRMED", "CANCELLED"],
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["RETURNED"],
};

/** WhatsApp wants the number with country code and digits only. */
function waNumber(phone: string) {
  const d = phone.replace(/\D/g, "");
  return d.length === 10 ? `91${d}` : d;
}

export default async function AdminBooking({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const b = await db.rentalBooking.findUnique({ where: { id }, include: { item: true, user: true } });
  if (!b) notFound();
  const payments = await db.payment.findMany({ where: { kind: "RENTAL", refId: b.id }, orderBy: { createdAt: "desc" } });
  const hello = encodeURIComponent(
    `Hi ${b.name.split(" ")[0]}, this is Humynex Robotics about your ${b.item.name} rental enquiry (${b.number}) for ${fmt(b.startDate)}.`,
  );

  return (
    <div className="max-w-[1000px]">
      <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-sm text-fg-2 hover:text-[#1E90FF]">
        <ArrowLeft size={14} /> Rental bookings
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <h1 className="display text-3xl">{b.item.name}</h1>
        <Status value={b.status} />
      </div>
      <p className="mt-1 font-mono text-sm text-fg-3">
        {b.number} / received {b.createdAt.toLocaleString("en-IN")}
      </p>
      <div className="mt-6">
        <Flash sp={sp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <section className="surface p-6">
            <h2 className="font-semibold">Event</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-fg-3">From</dt><dd className="mt-0.5 font-medium">{fmt(b.startDate)}</dd></div>
              <div><dt className="text-fg-3">To</dt><dd className="mt-0.5 font-medium">{fmt(b.endDate)}</dd></div>
              <div><dt className="text-fg-3">Length</dt><dd className="mt-0.5 font-medium">{b.days} day{b.days > 1 ? "s" : ""}</dd></div>
              <div><dt className="text-fg-3">Units</dt><dd className="mt-0.5 font-medium">{b.quantity} of {b.item.units}</dd></div>
              <div className="sm:col-span-2"><dt className="text-fg-3">Venue</dt><dd className="mt-0.5 font-medium">{b.venue}</dd></div>
              {b.notes && (
                <div className="sm:col-span-2"><dt className="text-fg-3">Notes from the customer</dt><dd className="mt-0.5 whitespace-pre-line leading-relaxed">{b.notes}</dd></div>
              )}
            </dl>
          </section>

          <section className="surface p-6">
            <h2 className="font-semibold">Price</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-fg-2">Rent ({formatINR(b.item.dailyRate)}/day list price)</dt><dd className="font-mono">{formatINR(b.rentTotal)}</dd></div>
              {b.discount > 0 && <div className="flex justify-between"><dt className="text-fg-2">Offer {b.couponCode}</dt><dd className="font-mono">- {formatINR(b.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-fg-2">Refundable deposit</dt><dd className="font-mono">{formatINR(b.deposit)}</dd></div>
              <div className="flex justify-between border-t border-[#050816]/10 pt-2 text-base font-semibold"><dt>Total</dt><dd className="font-mono">{formatINR(b.total)}</dd></div>
            </dl>
          </section>
        </div>

        <div className="space-y-6">
          <section className="surface p-6 text-sm">
            <h2 className="font-semibold">Customer</h2>
            <p className="mt-3 font-medium">{b.name}</p>
            <p className="text-fg-2">{b.phone}</p>
            <p className="text-fg-2">{b.email}</p>
            <p className="mt-1 text-xs text-fg-3">{b.user ? "Has an account: they'll see the Pay button once approved." : "No account yet: ask them to sign in with Google using this email to pay."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="btn btn-primary btn-sm"><Phone size={15} /> Call</a>
              <a href={`https://wa.me/${waNumber(b.phone)}?text=${hello}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><WhatsappLogo size={15} /> WhatsApp</a>
              <a href={`mailto:${b.email}?subject=${encodeURIComponent(`Your ${b.item.name} rental (${b.number})`)}`} className="btn btn-ghost btn-sm"><EnvelopeSimple size={15} /> Email</a>
            </div>
          </section>

          {b.status === "ENQUIRY" && (
            <section className="rounded-[20px] border-2 border-[#1E90FF]/30 bg-white p-6">
              <h2 className="font-semibold">Approve this booking</h2>
              <p className="mt-1 text-sm text-fg-2">After you&apos;ve spoken to the customer. Change the price if you agreed something different; leave it to keep the estimate.</p>
              <form action={approveBooking} className="mt-4 space-y-4">
                <input type="hidden" name="id" value={b.id} />
                <div className="grid grid-cols-2 gap-3">
                  <F label="Rent (₹)" name="rent">
                    <input id="rent" name="rent" inputMode="decimal" defaultValue={rupees(b.rentTotal)} className="input" />
                  </F>
                  <F label="Deposit (₹)" name="deposit">
                    <input id="deposit" name="deposit" inputMode="decimal" defaultValue={rupees(b.deposit)} className="input" />
                  </F>
                </div>
                <SubmitButton className="w-full">Approve and ask for payment</SubmitButton>
              </form>
              <form action={declineBooking} className="mt-3">
                <input type="hidden" name="id" value={b.id} />
                <button className="w-full rounded-full py-2 text-sm font-medium text-bad hover:bg-bad/5">Decline enquiry</button>
              </form>
            </section>
          )}

          {b.status === "APPROVED" && (
            <p className="rounded-[20px] bg-[#1E90FF]/10 p-5 text-sm text-[#0b5cad]">
              Approved and waiting for payment. The dates are held. It becomes confirmed automatically when the customer pays.
            </p>
          )}

          {NEXT[b.status]?.length > 0 && (
            <form action={setBookingStatus} className="surface flex items-end gap-3 p-6">
              <input type="hidden" name="id" value={b.id} />
              <div className="flex-1">
                <label htmlFor="status" className="mb-2 block text-sm font-medium">Move to</label>
                <select id="status" name="status" className="input h-10">
                  {NEXT[b.status].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>)}
                </select>
              </div>
              <SubmitButton>Update</SubmitButton>
            </form>
          )}

          <div className="text-sm">
            <h2 className="font-semibold">Payments</h2>
            <ul className="mt-2 space-y-1 font-mono text-xs text-fg-2">
              {payments.length === 0 && <li className="font-sans text-fg-3">No payment attempts yet.</li>}
              {payments.map((p) => (
                <li key={p.id}>
                  {p.provider} {p.providerPaymentId ?? p.providerOrderId} <span className={p.status === "PAID" ? "text-ok" : p.status === "FAILED" ? "text-bad" : ""}>{p.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
