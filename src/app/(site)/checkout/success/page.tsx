import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Clock } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { formatINR } from "@/lib/money";
import { ClearCart } from "./clear-cart";

export const metadata: Metadata = { title: "Confirmation", robots: { index: false } };

type SP = Promise<{ kind?: string; id?: string }>;

export default async function SuccessPage({ searchParams }: { searchParams: SP }) {
  const { kind, id } = await searchParams;
  if (!kind || !id) notFound();
  const user = await getUser();

  let title = "";
  let ref = "";
  let paid = false;
  let total = 0;
  let lines: string[] = [];
  let next = { href: "/shop", label: "Keep browsing" };
  let points = 0;

  if (kind === "ORDER") {
    const o = await db.order.findUnique({ where: { id }, include: { items: true } });
    if (!o) notFound();
    title = "Order placed";
    ref = o.number;
    paid = o.status !== "PENDING_PAYMENT" && o.status !== "CANCELLED";
    total = o.total;
    points = o.pointsEarned;
    lines = o.items.map((i) => `${i.qty} x ${i.name}`);
    lines.push(`Shipping to ${o.city}, ${o.state} ${o.postal}`);
  } else if (kind === "RENTAL") {
    const b = await db.rentalBooking.findUnique({ where: { id }, include: { item: true } });
    if (!b) notFound();
    title = "Rental booked";
    ref = b.number;
    paid = b.status === "CONFIRMED" || b.status === "ACTIVE" || b.status === "RETURNED";
    total = b.total;
    const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
    lines = [`${b.quantity} x ${b.item.name}`, `${fmt(b.startDate)} to ${fmt(b.endDate)} (${b.days} days)`, `Venue: ${b.venue}`, `Includes ${formatINR(b.deposit)} refundable deposit`];
    next = { href: "/rentals", label: "See other rentals" };
  } else if (kind === "PRINT") {
    const p = await db.printJob.findUnique({ where: { id } });
    if (!p) notFound();
    title = "Print job confirmed";
    ref = p.number;
    paid = ["PAID", "PRINTING", "READY", "SHIPPED"].includes(p.status);
    total = p.estimate;
    lines = [`${p.fileName}`, `${p.quantity} x ${p.material}, ${p.color}, ${p.infill}% infill`];
    next = { href: "/print", label: "Quote another part" };
  } else notFound();

  return (
    <div className="mx-auto max-w-[720px] px-4 pt-16 md:px-8">
      {kind === "ORDER" && paid && <ClearCart />}
      <div className="flex items-center gap-3">
        {paid ? <CheckCircle size={34} weight="fill" className="text-ok" /> : <Clock size={34} className="text-warn" />}
        <span className="font-mono text-sm text-fg-2">{ref}</span>
      </div>
      <h1 className="display-wide mt-4 text-4xl md:text-5xl">{paid ? title : "Waiting for payment"}</h1>
      <p className="mt-4 text-lg text-fg-2">
        {paid
          ? kind === "RENTAL"
            ? "We'll call you within one working day to plan delivery and setup."
            : kind === "PRINT"
              ? "Your file is in the queue. We'll email you when it's printed and ready."
              : "We'll email you tracking details when it ships."
          : "We haven't received confirmation of this payment yet. If you were charged, it will update shortly. Keep your reference number handy."}
      </p>

      <div className="surface mt-10 p-6">
        <ul className="space-y-2 text-fg-2">
          {lines.map((l) => <li key={l}>{l}</li>)}
        </ul>
        <div className="mt-5 flex justify-between border-t border-line pt-4">
          <span className="font-semibold">{paid ? "Paid" : "Amount due"}</span>
          <span className="font-mono font-semibold">{formatINR(total)}</span>
        </div>
      </div>

      {paid && user && (
        <p className="mt-6 text-fg-2">
          {points > 0 ? `You earned ${points} reward points on this order. ` : "Reward points have been added to your account. "}
          <Link href="/account" className="text-volt-hi hover:underline">See your balance</Link>
        </p>
      )}
      {paid && !user && (
        <p className="mt-6 text-fg-2">
          <Link href="/signup" className="text-volt-hi hover:underline">Create an account</Link> to earn points on your next order.
        </p>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href={next.href} className="btn btn-primary">{next.label}</Link>
        {user && <Link href="/account" className="btn btn-ghost">My account</Link>}
      </div>
    </div>
  );
}
