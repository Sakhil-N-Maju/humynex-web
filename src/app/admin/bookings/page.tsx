import Link from "next/link";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { PageHead, Flash, Table, Status } from "@/components/admin/ui";

const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

export default async function AdminBookings({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const bookings = await db.rentalBooking.findMany({ include: { item: true }, orderBy: [{ startDate: "asc" }], take: 300 });
  const enquiries = bookings.filter((b) => b.status === "ENQUIRY");
  const upcoming = bookings.filter((b) => !["ENQUIRY", "CANCELLED", "RETURNED"].includes(b.status));
  const past = bookings.filter((b) => b.status === "CANCELLED" || b.status === "RETURNED").reverse();

  const rows = (list: typeof bookings) =>
    list.map((b) => (
      <tr key={b.id}>
        <td>
          <Link href={`/admin/bookings/${b.id}`} className="font-medium hover:text-[#1E90FF]">
            {b.item.name}
            {b.quantity > 1 && <span className="text-fg-3"> x {b.quantity}</span>}
          </Link>
          <span className="block font-mono text-xs text-fg-3">{b.number}</span>
        </td>
        <td className="font-mono text-xs">
          {fmt(b.startDate)} to {fmt(b.endDate)}
          <span className="block text-fg-3">{b.days} days</span>
        </td>
        <td>
          {b.name}
          <span className="block text-xs text-fg-3">{b.phone}</span>
        </td>
        <td className="font-mono">{formatINR(b.total)}</td>
        <td>
          <Status value={b.status} />
        </td>
        <td className="text-right">
          <Link href={`/admin/bookings/${b.id}`} className="btn btn-ghost btn-sm">
            {b.status === "ENQUIRY" ? "Review" : "Open"}
          </Link>
        </td>
      </tr>
    ));

  const head = ["Item", "Dates", "Customer", "Amount", "Status", ""];

  return (
    <div className="max-w-[1300px]">
      <PageHead
        eyebrow="Inbox & sales"
        title="Rental bookings"
        sub="New enquiries first. Call the customer, then approve: the dates are held and they can pay from their account."
      />
      <Flash sp={sp} />
      <h2 className="mb-3 flex items-center gap-2 font-semibold">
        New enquiries
        {enquiries.length > 0 && <span className="rounded-full bg-[#1E90FF] px-2 py-0.5 font-mono text-xs text-white">{enquiries.length}</span>}
      </h2>
      <Table head={head} empty="No new enquiries.">{rows(enquiries)}</Table>
      <h2 className="mb-3 mt-10 font-semibold">Approved, confirmed and active</h2>
      <Table head={head} empty="No upcoming bookings.">{rows(upcoming)}</Table>
      <h2 className="mb-3 mt-10 font-semibold">Returned and cancelled</h2>
      <Table head={head} empty="Nothing yet.">{rows(past)}</Table>
    </div>
  );
}
