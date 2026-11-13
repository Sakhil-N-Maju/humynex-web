import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Truck, ArrowsCounterClockwise, Wrench } from "@phosphor-icons/react/dist/ssr";
import { db, parseJSON } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { Plate } from "@/components/ui/plate";
import { AddToCart } from "@/components/cart/add-to-cart";
import { ProductCard, StockNote } from "@/components/shop/product-card";
import { formatINR } from "@/lib/money";
import { DarkBand, DarkCurve, SectionLabel } from "@/components/brand/page-hero";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await db.product.findUnique({ where: { slug } });
  if (!p) return {};
  return {
    title: p.name,
    description: p.summary,
    alternates: { canonical: `/shop/${p.slug}` },
    openGraph: { title: p.name, description: p.summary, images: p.image ? [p.image] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await db.product.findUnique({ where: { slug } });
  if (!p || !p.active) notFound();
  const [related, shipping] = await Promise.all([
    db.product.findMany({ where: { active: true, category: p.category, id: { not: p.id } }, take: 4 }),
    getSetting("shipping"),
  ]);
  const specs = parseJSON<{ label: string; value: string }[]>(p.specs, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.summary,
    sku: p.sku ?? undefined,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    image: p.image ?? undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: (p.price / 100).toFixed(2),
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section data-theme="light" className="bg-white px-5 pb-28 pt-32 text-[#050816] md:px-8 md:pb-40 md:pt-36">
        <div className="mx-auto max-w-[1400px]">
          <Link
            href={`/shop?category=${encodeURIComponent(p.category)}`}
            className="inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[#050816]/55 hover:text-[#1E90FF]"
          >
            <ArrowLeft size={14} /> {p.category}
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Plate
                src={p.image}
                alt={p.name}
                kind={p.category}
                code={p.sku}
                priority
                chamfer={false}
                className="aspect-square w-full rounded-[28px]"
                sizes="(min-width:1024px) 55vw, 100vw"
              />
            </div>

            <div className="lg:pt-2">
              {p.brand && <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[#1E90FF]">{p.brand}</span>}
              <h1 className="display-wide mt-2 text-[2.6rem] md:text-[3.6rem]">{p.name}</h1>
              <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-[#050816]/65">{p.summary}</p>

              <div className="mt-9 flex items-baseline gap-3">
                <span className="font-mono text-3xl">{formatINR(p.price)}</span>
                {p.compareAt && p.compareAt > p.price && <s className="font-mono text-[#050816]/40">{formatINR(p.compareAt)}</s>}
                <span className="text-sm text-[#050816]/50">incl. GST</span>
              </div>
              <div className="mt-1">
                <StockNote stock={p.stock} />
              </div>
              <div className="mt-7">
                <AddToCart product={{ id: p.id, slug: p.slug, name: p.name, price: p.price, image: p.image, category: p.category, stock: p.stock }} />
              </div>

              <ul className="mt-10 space-y-3 border-t border-[#050816]/10 pt-7 text-[0.95rem] text-[#050816]/70">
                <li className="flex gap-3"><Truck size={18} className="mt-0.5 shrink-0 text-[#1E90FF]" /> Ships in 2 working days. Free over {formatINR(shipping.freeAbove)}, otherwise {formatINR(shipping.flat)}.</li>
                <li className="flex gap-3"><ArrowsCounterClockwise size={18} className="mt-0.5 shrink-0 text-[#1E90FF]" /> 7-day replacement for parts that arrive faulty.</li>
                <li className="flex gap-3"><Wrench size={18} className="mt-0.5 shrink-0 text-[#1E90FF]" /> Stuck on wiring? Call the lab and an engineer will help.</li>
              </ul>

              {specs.length > 0 && (
                <section className="mt-12">
                  <h2 className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[#050816]/50">Specifications</h2>
                  <dl className="mt-4 grid grid-cols-2 gap-2">
                    {specs.map((s) => (
                      <div key={s.label} className="rounded-[16px] bg-[#f2f5fa] p-4">
                        <dt className="text-xs text-[#050816]/50">{s.label}</dt>
                        <dd className="mt-1 font-mono text-sm">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              <section className="mt-12 max-w-[62ch] space-y-4 text-[#050816]/70">
                {p.description.split(/\n\s*\n/).map((para, i) => (
                  <p key={i} className="leading-relaxed">{para}</p>
                ))}
              </section>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <DarkBand curve label={`More ${p.category}`}>
          <div className="mx-auto max-w-[1400px]">
            <SectionLabel dark>Keep building</SectionLabel>
            <h2 className="display-wide mt-4 text-[2.4rem] md:text-[3.6rem]">More {p.category.toLowerCase()}</h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <ProductCard key={r.id} p={r} />
              ))}
            </div>
          </div>
        </DarkBand>
      )}
      {related.length === 0 && <DarkCurve />}
    </>
  );
}
