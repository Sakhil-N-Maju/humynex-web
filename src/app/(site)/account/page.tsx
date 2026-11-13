import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { tierFor } from "@/lib/tiers";
import { formatINR } from "@/lib/money";
import { logout } from "@/app/actions/auth";
import { WelcomeBurst } from "./welcome-burst";
import { PayNow } from "./pay-now";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const STATUS: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  CONFIRMED: "Confirmed",
  ACTIVE: "In progress",
  RETURNED: "Returned",
  QUOTED: "Under review",
  PRINTING: "Printing",
  READY: "Ready",
};
const REASON: Record<string, string> = {
  SIGNUP_BONUS: "Welcome bonus",
  PURCHASE: "Earned",
  REDEEM: "Spent",
  ADMIN_ADJUST: "Adjustment",
  REFUND: "Refunded",
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireUser("/account");
  const { welcome } = await searchParams;
  const [ledger, orders, bookings, prints] = await Promise.all([
    db.pointsEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 12 }),
    db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { items: true }, take: 20 }),
    db.rentalBooking.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { item: true }, take: 20 }),
    db.printJob.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  const { current, next, toNext } = tierFor(user.lifetimePts);
  const pct = next ? Math.min(100, Math.round(((user.lifetimePts - current.min) / (next.min - current.min)) * 100)) : 100;

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-12 md:px-8">
      {welcome && <WelcomeBurst points={user.points} />}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-fg-2">Hello, {user.name.split(" ")[0]}</p>
          <h1 className="display-wide text-4xl md:text-5xl">Your account</h1>
        </div>
        <form action={logout}>
          <button className="btn btn-ghost btn-sm">Sign out</button>
        </form>
      </div>

      <section className="chamfer chamfer-lg mt-10 grid gap-8 bg-[linear-gradient(120deg,#0f2a5c,#0a1024_60%)] p-7 md:grid-cols-[auto_1fr] md:items-center md:p-9">
        <div>
          <span className="text-sm text-fg-2">Reward points</span>
          <div className="display-wide text-6xl text-fg">{user.points.toLocaleString("en-IN")}</div>
          <span className="text-sm text-fg-2">Worth {formatINR(user.points * 100)} at checkout</span>
        </div>
        <div className="md:pl-10">
          <div className="flex items-baseline justify-between text-sm">
            <span>
              <span className="font-semibold text-volt-hi">{current.name}</span> member
            </span>
            {next && <span className="text-fg-2">{toNext.toLocaleString("en-IN")} pts to {next.name}</span>}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/60" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next tier">
            <div className="h-full bg-volt" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-3 text-sm text-fg-2">{current.perk}</p>
        </div>
      </section>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-14">
          <Block title="Orders" empty="No orders yet." cta={{ href: "/shop", label: "Shop parts" }} count={orders.length}>
            {orders.map((o) => (
              <Row key={o.id} title={o.number} meta={`${fmtDate(o.createdAt)} / ${o.items.reduce((n, i) => n + i.qty, 0)} items`} amount={o.total} status={o.status}>
                {o.status === "PENDING_PAYMENT" && <PayNow kind="ORDER" id={o.id} />}
              </Row>
            ))}
          </Block>
          <Block title="Rental bookings" empty="No rentals yet." cta={{ href: "/rentals", label: "See rentals" }} count={bookings.length}>
            {bookings.map((b) => (
              <Row key={b.id} title={`${b.item.name}`} meta={`${b.number} / ${fmtDate(b.startDate)}, ${b.days} days`} amount={b.total} status={b.status}>
                {b.status === "PENDING_PAYMENT" && <PayNow kind="RENTAL" id={b.id} />}
              </Row>
            ))}
          </Block>
          <Block title="3D print jobs" empty="No print jobs yet." cta={{ href: "/print", label: "Get a quote" }} count={prints.length}>
            {prints.map((p) => (
              <Row key={p.id} title={p.fileName} meta={`${p.number} / ${p.material}, ${p.quantity} pcs`} amount={p.estimate} status={p.status}>
                {p.status === "PENDING_PAYMENT" && <PayNow kind="PRINT" id={p.id} />}
              </Row>
            ))}
          </Block>
        </div>

        <aside>
          <h2 className="text-lg font-semibold">Points history</h2>
          <ul className="mt-4 divide-y divide-line">
            {ledger.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3 text-sm">
                <span>
                  <span className="block">{REASON[e.reason] ?? e.reason}</span>
                  <span className="text-xs text-fg-3">{e.note ?? ""} {fmtDate(e.createdAt)}</span>
                </span>
                <span className={`font-mono ${e.delta > 0 ? "text-ok" : "text-fg-2"}`}>{e.delta > 0 ? `+${e.delta}` : e.delta}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

function Block({ title, empty, cta, count, children }: { title: string; empty: string; cta: { href: string; label: string }; count: number; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      {count === 0 ? (
        <p className="mt-4 text-fg-2">
          {empty} <Link href={cta.href} className="text-volt-hi hover:underline">{cta.label}</Link>
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">{children}</ul>
      )}
    </section>
  );
}

function Row({ title, meta, amount, status, children }: { title: string; meta: string; amount: number; status: string; children?: React.ReactNode }) {
  const tone = status === "CANCELLED" ? "text-bad" : status === "PENDING_PAYMENT" || status === "QUOTED" ? "text-warn" : "text-ok";
  return (
    <li className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{title}</p>
        <p className="text-sm text-fg-3">{meta}</p>
      </div>
      <span className={`text-sm ${tone}`}>{STATUS[status] ?? status}</span>
      <span className="w-24 text-right font-mono">{formatINR(amount)}</span>
      {children}
    </li>
  );
}
