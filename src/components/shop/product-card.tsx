import Link from "next/link";
import { Plate } from "@/components/ui/plate";
import { AddToCart } from "@/components/cart/add-to-cart";
import { formatINR } from "@/lib/money";

export type CardProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAt: number | null;
  stock: number;
  image: string | null;
  sku: string | null;
  summary: string;
};

/** Stock line for white surfaces. */
export function StockNote({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="text-sm text-[#c2410c]">Out of stock</span>;
  if (stock <= 5) return <span className="text-sm text-[#b45309]">Only {stock} left</span>;
  return <span className="text-sm text-[#050816]/50">In stock</span>;
}

/** White card on the navy page, in the same voice as the landing's service cards. */
export function ProductCard({ p }: { p: CardProduct }) {
  return (
    <article data-theme="light" className="group relative flex h-full flex-col rounded-[24px] bg-white p-3 text-[#050816] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1">
      <Link href={`/shop/${p.slug}`} className="block overflow-hidden rounded-[16px]" tabIndex={-1} aria-hidden="true">
        <Plate
          src={p.image}
          alt=""
          kind={p.category}
          code={p.sku}
          chamfer={false}
          className="aspect-[4/3] w-full transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 100vw"
        />
      </Link>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.08em] text-[#050816]/45">{p.category}</span>
        <h3 className="mt-1.5 text-[1.05rem] font-semibold leading-snug">
          <Link href={`/shop/${p.slug}`} className="after:absolute after:inset-0 hover:text-[#1E90FF]">
            {p.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[1.05rem]">{formatINR(p.price)}</span>
              {p.compareAt && p.compareAt > p.price && <s className="font-mono text-sm text-[#050816]/40">{formatINR(p.compareAt)}</s>}
            </div>
            <StockNote stock={p.stock} />
          </div>
          <div className="relative z-10">
            <AddToCart compact product={{ id: p.id, slug: p.slug, name: p.name, price: p.price, image: p.image, category: p.category, stock: p.stock }} />
          </div>
        </div>
      </div>
    </article>
  );
}
