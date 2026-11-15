import Link from "next/link";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { PageHead, Flash, Table, LiveTag, Thumb } from "@/components/admin/ui";

export default async function AdminRentals({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const items = await db.rentalItem.findMany({ orderBy: [{ active: "desc" }, { sortOrder: "asc" }], include: { _count: { select: { bookings: true } } } });
  return (
    <div className="max-w-[1200px]">
      <PageHead
        eyebrow="Website · Rentals"
        title="Rentals"
        sub="Robots and costumes customers can enquire about. Click one to change prices, text or photos."
        action={{ href: "/admin/rentals/new", label: "Add rental" }}
      />
      <Flash sp={sp} />
      <Table head={["Rental", "Day rate", "Deposit", "Units", "Bookings", "Status"]}>
        {items.map((r) => (
          <tr key={r.id}>
            <td>
              <Link href={`/admin/rentals/${r.id}`} className="flex items-center gap-3 font-medium hover:text-[#1E90FF]">
                <Thumb src={r.image} />
                <span>
                  {r.name}
                  <span className="block max-w-[34ch] truncate text-xs font-normal text-fg-3">{r.tagline}</span>
                </span>
              </Link>
            </td>
            <td className="font-mono">{formatINR(r.dailyRate)}</td>
            <td className="font-mono text-fg-2">{formatINR(r.deposit)}</td>
            <td className="font-mono">{r.units}</td>
            <td className="font-mono">{r._count.bookings}</td>
            <td><LiveTag live={r.active} /></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
