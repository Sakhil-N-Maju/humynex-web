import Link from "next/link";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { PageHead, Flash, Table } from "@/components/admin/ui";

export default async function AdminRentals({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const items = await db.rentalItem.findMany({ orderBy: [{ active: "desc" }, { sortOrder: "asc" }], include: { _count: { select: { bookings: true } } } });
  return (
    <div className="max-w-[1200px]">
      <PageHead title="Rental fleet" sub="Robots and costumes customers can book." action={{ href: "/admin/rentals/new", label: "Add rental item" }} />
      <Flash sp={sp} />
      <Table head={["Item", "Day rate", "Deposit", "Units", "Bookings", "Status"]}>
        {items.map((r) => (
          <tr key={r.id} className="hover:bg-ink-2">
            <td className="px-4 py-3"><Link href={`/admin/rentals/${r.id}`} className="font-medium hover:text-volt-hi">{r.name}</Link></td>
            <td className="px-4 py-3 font-mono">{formatINR(r.dailyRate)}</td>
            <td className="px-4 py-3 font-mono text-fg-2">{formatINR(r.deposit)}</td>
            <td className="px-4 py-3 font-mono">{r.units}</td>
            <td className="px-4 py-3 font-mono">{r._count.bookings}</td>
            <td className="px-4 py-3 text-xs">{r.active ? <span className="text-ok">Live</span> : <span className="text-fg-3">Hidden</span>}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
