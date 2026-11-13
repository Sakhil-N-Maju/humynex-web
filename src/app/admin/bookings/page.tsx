import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { setBookingStatus } from "../actions";
import { PageHead, Flash, Table, Status, SubmitButton } from "@/components/admin/ui";

const STATUSES = ["PENDING_PAYMENT", "CONFIRMED", "ACTIVE", "RETURNED", "CANCELLED"];
const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

export default async function AdminBookings({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const bookings = await db.rentalBooking.findMany({ include: { item: true }, orderBy: [{ startDate: "asc" }], take: 300 });
  const upcoming = bookings.filter((b) => b.status !== "CANCELLED" && b.status !== "RETURNED");
  const past = bookings.filter((b) => b.status === "CANCELLED" || b.status === "RETURNED");

  const rows = (list: typeof bookings) =>
    list.map((b) => (
      <tr key={b.id} className="align-top hover:bg-ink-2">
        <td className="px-4 py-3"><span className="font-medium">{b.item.name}</span>{b.quantity > 1 && <span className="text-fg-3"> x {b.quantity}</span>}<span className="block font-mono text-xs text-fg-3">{b.number}</span></td>
        <td className="px-4 py-3 font-mono text-xs">{fmt(b.startDate)} to {fmt(b.endDate)}<span className="block text-fg-3">{b.days} days</span></td>
        <td className="px-4 py-3">{b.name}<span className="block text-xs text-fg-3"><a href={`tel:${b.phone}`} className="hover:text-volt-hi">{b.phone}</a></span><span className="block text-xs text-fg-3">{b.venue}</span>{b.notes && <span className="mt-1 block max-w-[28ch] text-xs text-fg-2">{b.notes}</span>}</td>
        <td className="px-4 py-3 font-mono">{formatINR(b.total)}<span className="block text-xs text-fg-3">incl. {formatINR(b.deposit)} deposit</span></td>
        <td className="px-4 py-3">
          <Status value={b.status} />
          <form action={setBookingStatus} className="mt-2 flex gap-2">
            <input type="hidden" name="id" value={b.id} />
            <label htmlFor={`s-${b.id}`} className="sr-only">Status</label>
            <select id={`s-${b.id}`} name="status" defaultValue={b.status} className="input h-8 w-36 text-xs">
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>)}
            </select>
            <SubmitButton className="!h-8">Set</SubmitButton>
          </form>
        </td>
      </tr>
    ));

  return (
    <div className="max-w-[1300px]">
      <PageHead title="Rental bookings" sub="Unpaid holds release their dates after 30 minutes." />
      <Flash sp={sp} />
      <h2 className="mb-3 font-semibold">Upcoming and active</h2>
      <Table head={["Item", "Dates", "Customer", "Amount", "Status"]} empty="No upcoming bookings.">{rows(upcoming)}</Table>
      <h2 className="mb-3 mt-10 font-semibold">Returned and cancelled</h2>
      <Table head={["Item", "Dates", "Customer", "Amount", "Status"]} empty="Nothing yet.">{rows(past.reverse())}</Table>
    </div>
  );
}
