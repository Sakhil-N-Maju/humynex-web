import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/shop/product-card";
import { Reveal } from "@/components/fx/reveal";
import { PageHero, DarkBand, btnOutlineLight } from "@/components/brand/page-hero";

export const metadata: Metadata = {
  title: "Shop robotics and electronics components",
  description: "Microcontrollers, motors, sensors, drivers and robot kits, shipped from Kalady, Kerala. Free shipping over ₹999.",
  alternates: { canonical: "/shop" },
};

const SORTS = {
  featured: { label: "Featured", orderBy: [{ featured: "desc" }, { createdAt: "asc" }] },
  "price-asc": { label: "Price, low to high", orderBy: [{ price: "asc" }] },
  "price-desc": { label: "Price, high to low", orderBy: [{ price: "desc" }] },
  new: { label: "Newest", orderBy: [{ createdAt: "desc" }] },
} satisfies Record<string, { label: string; orderBy: Prisma.ProductOrderByWithRelationInput[] }>;

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const category = sp.category;
  const q = sp.q?.trim();
  const sort = (sp.sort && sp.sort in SORTS ? sp.sort : "featured") as keyof typeof SORTS;

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(category ? { category } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { summary: { contains: q } }, { sku: { contains: q } }] } : {}),
  };
  const [products, cats] = await Promise.all([
    db.product.findMany({ where, orderBy: SORTS[sort].orderBy }),
    db.product.groupBy({ by: ["category"], where: { active: true }, _count: true, orderBy: { category: "asc" } }),
  ]);
  const total = cats.reduce((n, c) => n + c._count, 0);

  const href = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { category, q, sort: sort === "featured" ? undefined : sort, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    const s = next.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  return (
    <>
      <PageHero
        eyebrow="Shop · Parts & kits"
        title="Parts for your next build."
        sub={<>The boards, motors and sensors we use in our own robots. Ships from Kalady in two working days, free over ₹999.</>}
      />

      <DarkBand curve label="Catalogue" className="!pt-10 md:!pt-14">
        <div className="mx-auto max-w-[1400px]">
          <div className="py-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <nav aria-label="Categories" className="flex snap-x gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[{ category: undefined, label: "All", n: total }, ...cats.map((c) => ({ category: c.category, label: c.category, n: c._count }))].map((c) => {
                  const active = c.category === category;
                  return (
                    <Link
                      key={c.label}
                      href={href({ category: c.category })}
                      className={clsx(
                        "shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                        active ? "border-white bg-white text-[#050816]" : "border-white/20 text-white/75 hover:border-white hover:text-white",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {c.label} <span className={clsx("ml-0.5 font-mono text-xs", active ? "text-[#050816]/55" : "text-white/40")}>{c.n}</span>
                    </Link>
                  );
                })}
              </nav>
              <form action="/shop" className="flex flex-wrap gap-2 sm:flex-nowrap xl:ml-auto">
                {category && <input type="hidden" name="category" value={category} />}
                <label className="relative basis-full sm:flex-1 sm:basis-auto xl:w-64">
                  <span className="sr-only">Search parts</span>
                  <MagnifyingGlass size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45" />
                  <input name="q" defaultValue={q} placeholder="Search parts" className="input h-11 !rounded-full pl-10" />
                </label>
                <label className="flex-1 sm:flex-none">
                  <span className="sr-only">Sort</span>
                  <select name="sort" defaultValue={sort} className="input h-11 !rounded-full sm:w-auto">
                    {Object.entries(SORTS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="h-11 rounded-full bg-[#1E90FF] px-5 text-sm font-semibold text-[#050816] transition-colors hover:bg-[#67D4FF]">Apply</button>
              </form>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="display text-4xl">No parts match that.</p>
              <p className="mx-auto mt-4 max-w-[48ch] text-white/60">
                Try a broader search, or <Link href="/contact" className="text-[#67D4FF] hover:underline">ask us to source it</Link>. We stock far more than we list.
              </p>
              <Link href="/shop" className={`${btnOutlineLight} mt-8`}>Clear filters</Link>
            </div>
          ) : (
            <>
              <p className="mt-8 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-white/45">
                {products.length} part{products.length === 1 ? "" : "s"}
                {category ? ` in ${category}` : ""}
                {q ? ` matching “${q}”` : ""}
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((p, i) => (
                  <Reveal key={p.id} delay={Math.min(i % 4, 3) * 0.05} className="h-full">
                    <ProductCard p={p} />
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </DarkBand>
    </>
  );
}
