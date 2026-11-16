import Link from "next/link";
import clsx from "clsx";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { PageHead, Flash, Table, Status } from "@/components/admin/ui";

const FILTERS = ["ALL", "PENDING_PAYMENT", "PAID", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default async function AdminOrders({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const status = sp.status && FILTERS.includes(sp.status) ? sp.status : "ALL";
  const orders = await db.order.findMany({
    where: status === "ALL" ? undefined : { status },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
    take: 200,
  });
  return (
    <div className="max-w-[1200px]">
      <PageHead title="Orders" sub="Parts orders. Unpaid orders are kept so customers can retry payment." />
      <Flash sp={sp} />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link key={f} href={f === "ALL" ? "/admin/orders" : `/admin/orders?status=${f}`} className={clsx("rounded-[18px] border px-3 py-1.5 text-xs", f === status ? "border-volt bg-volt text-white" : "border-line-2 text-fg-2 hover:text-fg")}>
            {f.replace(/_/g, " ").toLowerCase()}
          </Link>
        ))}
      </div>
      <Table head={["Order", "Customer", "Placed", "Items", "Total", "Status"]}>
        {orders.map((o) => (
          <tr key={o.id} className="hover:bg-ink-2">
            <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold hover:text-volt-hi">{o.number}</Link></td>
            <td className="px-4 py-3">{o.name}<span className="block text-xs text-fg-3">{o.city}</span></td>
            <td className="px-4 py-3 text-fg-2">{o.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
            <td className="px-4 py-3 font-mono">{o._count.items}</td>
            <td className="px-4 py-3 font-mono">{formatINR(o.total)}</td>
            <td className="px-4 py-3"><Status value={o.status} /></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
