import Link from "next/link";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { razorpayConfigured } from "@/lib/payments";
import { Status } from "@/components/admin/ui";

const DAY = 86400000;

/** Reporting windows, computed per request (this is a server component). */
function windows() {
  const now = Date.now();
  return { since: new Date(now - 30 * DAY), soon: new Date(now + 7 * DAY) };
}

export default async function AdminHome() {
  const { since, soon } = windows();
  const [paid30, ordersToShip, upcoming, printQueue, review, lowStock, unread, customers, recentOrders, placeholders] = await Promise.all([
    db.payment.aggregate({ where: { status: "PAID", createdAt: { gte: since } }, _sum: { amount: true }, _count: true }),
    db.order.count({ where: { status: { in: ["PAID", "PACKED"] } } }),
    db.rentalBooking.findMany({ where: { status: "CONFIRMED", startDate: { lte: soon } }, include: { item: true }, orderBy: { startDate: "asc" }, take: 6 }),
    db.printJob.count({ where: { status: { in: ["PAID", "PRINTING"] } } }),
    db.printJob.count({ where: { status: "QUOTED" } }),
    db.product.findMany({ where: { active: true, stock: { lte: 5 } }, orderBy: { stock: "asc" }, take: 8 }),
    db.contactMessage.count({ where: { read: false } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.teamMember.count({ where: { isPlaceholder: true, active: true } }),
  ]);

  const tiles = [
    { label: "Paid in the last 30 days", value: formatINR(paid30._sum.amount ?? 0), sub: `${paid30._count} payments` },
    { label: "Orders to ship", value: ordersToShip, href: "/admin/orders?status=PAID" },
    { label: "Prints in the queue", value: printQueue, sub: review ? `${review} need a manual quote` : "None waiting for review", href: "/admin/prints" },
    { label: "Customers", value: customers, sub: unread ? `${unread} unread messages` : "Inbox clear", href: "/admin/customers" },
  ];

  return (
    <div className="max-w-[1200px]">
      <h1 className="display-wide text-[2.2rem] md:text-[2.9rem]">Overview</h1>

      {!razorpayConfigured() && (
        <p className="mt-6 rounded-[18px] border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          Razorpay keys aren&apos;t set, so checkout runs in test mode (no money is taken). Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET to go live. Production builds refuse test payments.
        </p>
      )}
      {placeholders > 0 && (
        <p className="mt-3 rounded-[18px] border border-line-2 px-4 py-3 text-sm text-fg-2">
          {placeholders} team profiles are still placeholders. <Link href="/admin/team" className="text-volt-hi hover:underline">Add real names and photos</Link>.
        </p>
      )}

      <div className="mt-8 grid gap-px overflow-hidden rounded-[18px] bg-line sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => {
          const body = (
            <>
              <span className="text-sm text-fg-3">{t.label}</span>
              <span className="display mt-2 block text-3xl">{t.value}</span>
              {t.sub && <span className="mt-1 block text-xs text-fg-2">{t.sub}</span>}
            </>
          );
          return t.href ? (
            <Link key={t.label} href={t.href} className="bg-ink-2 p-5 transition-colors hover:bg-ink-3">{body}</Link>
          ) : (
            <div key={t.label} className="bg-ink-2 p-5">{body}</div>
          );
        })}
      </div>

      {/* minmax(0,1fr) and min-w-0: a long row must never widen the column past the screen */}
      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 xl:grid-cols-2 [&>*]:min-w-0">
        <section>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="font-semibold">Rentals in the next 7 days</h2>
            <Link href="/admin/bookings" className="text-sm text-volt-hi hover:underline">All bookings</Link>
          </div>
          <ul className="mt-3 divide-y divide-line rounded-[18px] border border-line">
            {upcoming.length === 0 && <li className="px-4 py-6 text-sm text-fg-3">No confirmed rentals this week.</li>}
            {upcoming.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block">{b.item.name}</span>
                  <span className="block truncate text-xs text-fg-3">{b.name}, {b.venue}</span>
                </span>
                <span className="font-mono text-xs text-fg-2">{b.startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" })}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="font-semibold">Low stock</h2>
            <Link href="/admin/products" className="text-sm text-volt-hi hover:underline">All products</Link>
          </div>
          <ul className="mt-3 divide-y divide-line rounded-[18px] border border-line">
            {lowStock.length === 0 && <li className="px-4 py-6 text-sm text-fg-3">Everything has more than 5 in stock.</li>}
            {lowStock.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/products/${p.id}`} className="flex items-center justify-between gap-4 px-4 py-3 text-sm hover:bg-ink-2">
                  <span className="min-w-0 truncate">{p.name}</span>
                  <span className={`font-mono ${p.stock <= 0 ? "text-bad" : "text-warn"}`}>{p.stock}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="xl:col-span-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="font-semibold">Latest orders</h2>
            <Link href="/admin/orders" className="text-sm text-volt-hi hover:underline">All orders</Link>
          </div>
          <ul className="mt-3 divide-y divide-line rounded-[18px] border border-line">
            {recentOrders.length === 0 && <li className="px-4 py-6 text-sm text-fg-3">No orders yet.</li>}
            {recentOrders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm hover:bg-ink-2">
                  <span className="min-w-0 flex-1 basis-40">
                    <span className="block font-mono">{o.number}</span>
                    <span className="block truncate text-fg-3">{o.name}</span>
                  </span>
                  <Status value={o.status} />
                  <span className="ml-auto text-right font-mono">{formatINR(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
