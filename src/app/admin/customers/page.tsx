import { db } from "@/lib/db";
import { tierFor } from "@/lib/tiers";
import { formatINR } from "@/lib/money";
import { adjustPoints } from "../actions";
import { PageHead, Flash, Table, SubmitButton } from "@/components/admin/ui";

export default async function AdminCustomers({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const users = await db.user.findMany({
    where: { role: "CUSTOMER", ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}) },
    orderBy: { createdAt: "desc" },
    include: { orders: { where: { status: { notIn: ["PENDING_PAYMENT", "CANCELLED"] } }, select: { total: true } } },
    take: 200,
  });
  return (
    <div className="max-w-[1200px]">
      <PageHead title="Customers" sub={`${users.length} member accounts`} />
      <Flash sp={sp} />
      <form className="mb-4 flex max-w-sm gap-2">
        <label htmlFor="cq" className="sr-only">Search</label>
        <input id="cq" name="q" defaultValue={q} placeholder="Search name or email" className="input h-10" />
        <button className="btn btn-ghost btn-sm h-10">Search</button>
      </form>
      <Table head={["Customer", "Joined", "Spent on parts", "Points", "Adjust points"]}>
        {users.map((u) => (
          <tr key={u.id} className="hover:bg-ink-2">
            <td className="px-4 py-3">{u.name}<span className="block text-xs text-fg-3">{u.email}{u.phone ? ` / ${u.phone}` : ""}</span></td>
            <td className="px-4 py-3 text-fg-2">{u.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
            <td className="px-4 py-3 font-mono">{formatINR(u.orders.reduce((n, o) => n + o.total, 0))}</td>
            <td className="px-4 py-3"><span className="font-mono">{u.points}</span><span className="block text-xs text-fg-3">{tierFor(u.lifetimePts).current.name}</span></td>
            <td className="px-4 py-3">
              <form action={adjustPoints} className="flex gap-2">
                <input type="hidden" name="userId" value={u.id} />
                <label htmlFor={`d-${u.id}`} className="sr-only">Points to add or remove</label>
                <input id={`d-${u.id}`} name="delta" type="number" placeholder="+50 / -50" className="input h-8 w-24 font-mono text-xs" />
                <label htmlFor={`n-${u.id}`} className="sr-only">Reason</label>
                <input id={`n-${u.id}`} name="note" placeholder="Reason" className="input h-8 w-32 text-xs" />
                <SubmitButton className="!h-8">Apply</SubmitButton>
              </form>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
