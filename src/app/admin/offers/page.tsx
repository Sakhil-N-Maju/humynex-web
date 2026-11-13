import Link from "next/link";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { PageHead, Flash, Table } from "@/components/admin/ui";

export default async function AdminOffers({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const coupons = await db.coupon.findMany({ orderBy: [{ active: "desc" }, { createdAt: "desc" }] });
  const now = new Date();
  return (
    <div className="max-w-[1200px]">
      <PageHead title="Offers" sub="Coupon codes. Offers marked public appear on the Offers page." action={{ href: "/admin/offers/new", label: "Create offer" }} />
      <Flash sp={sp} />
      <Table head={["Code", "Offer", "Applies to", "Used", "State"]}>
        {coupons.map((c) => {
          const expired = c.endsAt && c.endsAt < now;
          return (
            <tr key={c.id} className="hover:bg-ink-2">
              <td className="px-4 py-3"><Link href={`/admin/offers/${c.id}`} className="font-mono font-semibold hover:text-volt-hi">{c.code}</Link></td>
              <td className="px-4 py-3">
                {c.title}
                <span className="block text-xs text-fg-3">{c.type === "PERCENT" ? `${c.value}% off` : `${formatINR(c.value)} off`}{c.minOrder ? `, min ${formatINR(c.minOrder)}` : ""}</span>
              </td>
              <td className="px-4 py-3 text-fg-2">{c.appliesTo.toLowerCase()}{c.membersOnly ? ", members" : ""}</td>
              <td className="px-4 py-3 font-mono">{c.usedCount}{c.usageLimit !== null ? ` / ${c.usageLimit}` : ""}</td>
              <td className="px-4 py-3 text-xs">
                {!c.active ? <span className="text-fg-3">Off</span> : expired ? <span className="text-warn">Expired</span> : <span className="text-ok">Live</span>}
                {c.showOnSite && c.active && !expired && <span className="ml-2 text-volt-hi">Public</span>}
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
