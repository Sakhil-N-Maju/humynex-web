import Link from "next/link";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { PageHead, Flash, Table } from "@/components/admin/ui";

export default async function AdminProducts({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const products = await db.product.findMany({
    where: q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }, { category: { contains: q } }] } : undefined,
    orderBy: [{ active: "desc" }, { category: "asc" }, { name: "asc" }],
  });
  return (
    <div className="max-w-[1200px]">
      <PageHead title="Products" sub={`${products.length} products`} action={{ href: "/admin/products/new", label: "Add product" }} />
      <Flash sp={sp} />
      <form className="mb-4 flex max-w-sm gap-2">
        <label htmlFor="pq" className="sr-only">Search</label>
        <input id="pq" name="q" defaultValue={q} placeholder="Search name, SKU, category" className="input h-10" />
        <button className="btn btn-ghost btn-sm h-10">Search</button>
      </form>
      <Table head={["Product", "Category", "Price", "Stock", "Status"]}>
        {products.map((p) => (
          <tr key={p.id} className="hover:bg-ink-2">
            <td className="px-4 py-3">
              <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-volt-hi">{p.name}</Link>
              {p.sku && <span className="block font-mono text-xs text-fg-3">{p.sku}</span>}
            </td>
            <td className="px-4 py-3 text-fg-2">{p.category}</td>
            <td className="px-4 py-3 font-mono">{formatINR(p.price)}</td>
            <td className={`px-4 py-3 font-mono ${p.stock <= 0 ? "text-bad" : p.stock <= 5 ? "text-warn" : ""}`}>{p.stock}</td>
            <td className="px-4 py-3 text-xs">
              {p.active ? <span className="text-ok">Live</span> : <span className="text-fg-3">Hidden</span>}
              {p.featured && <span className="ml-2 text-volt-hi">Featured</span>}
              {!p.image && <span className="ml-2 text-fg-3">No photo</span>}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
