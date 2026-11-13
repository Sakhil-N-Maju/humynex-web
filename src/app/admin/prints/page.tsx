import Link from "next/link";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { PageHead, Flash, Table, Status } from "@/components/admin/ui";

export default async function AdminPrints({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const jobs = await db.printJob.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div className="max-w-[1200px]">
      <PageHead title="Print jobs" sub="Jobs marked quoted need a manual price before the customer can pay." />
      <Flash sp={sp} />
      <Table head={["Job", "File", "Spec", "Customer", "Price", "Status"]}>
        {jobs.map((j) => (
          <tr key={j.id} className="hover:bg-ink-2">
            <td className="px-4 py-3"><Link href={`/admin/prints/${j.id}`} className="font-mono font-semibold hover:text-volt-hi">{j.number}</Link></td>
            <td className="max-w-[200px] truncate px-4 py-3 text-fg-2">{j.fileName}</td>
            <td className="px-4 py-3 text-xs">{j.quantity} x {j.material} {j.color}<span className="block text-fg-3">{j.infill}% / {j.quality.toLowerCase()}</span></td>
            <td className="px-4 py-3">{j.name}</td>
            <td className="px-4 py-3 font-mono">{formatINR(j.estimate)}</td>
            <td className="px-4 py-3"><Status value={j.status} />{j.needsReview && <span className="ml-2 text-xs text-warn">review</span>}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
