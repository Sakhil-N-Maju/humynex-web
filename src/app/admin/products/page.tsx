import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { PageHead, Flash, Table, LiveTag, Thumb } from "@/components/admin/ui";

export default async function AdminProducts({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const products = await db.product.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }, { category: { contains: q, mode: "insensitive" } }] } : undefined,
    orderBy: [{ active: "desc" }, { category: "asc" }, { name: "asc" }],
  });
  return (
    <div className="max-w-[1200px]">
      <PageHead
        eyebrow="Website · Shop"
        title="Shop parts"
        sub={`${products.length} parts. Click one to change its price, stock, photo or description.`}
        action={{ href: "/admin/products/new", label: "Add part" }}
      />
      <Flash sp={sp} />
      <form className="mb-5 flex max-w-md gap-2">
        <label htmlFor="pq" className="sr-only">Search</label>
        <span className="relative flex-1">
          <MagnifyingGlass size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-3" />
          <input id="pq" name="q" defaultValue={q} placeholder="Search name, SKU or category" className="input !rounded-full pl-10" />
        </span>
        <button className="btn btn-ghost">Search</button>
      </form>
      <Table head={["Part", "Category", "Price", "Stock", "Status"]}>
        {products.map((p) => (
          <tr key={p.id}>
            <td>
              <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 font-medium hover:text-[#1E90FF]">
                <Thumb src={p.image} />
                <span>
                  {p.name}
                  {p.sku && <span className="block font-mono text-xs font-normal text-fg-3">{p.sku}</span>}
                </span>
              </Link>
            </td>
            <td className="text-fg-2">{p.category}</td>
            <td className="font-mono">{formatINR(p.price)}</td>
            <td className={`font-mono ${p.stock <= 0 ? "text-bad" : p.stock <= 5 ? "text-warn" : ""}`}>{p.stock}</td>
            <td>
              <span className="flex flex-wrap gap-1.5">
                <LiveTag live={p.active} />
                {p.featured && <span className="rounded-full bg-[#1E90FF]/10 px-2.5 py-1 text-xs font-medium text-[#1E90FF]">Featured</span>}
              </span>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
