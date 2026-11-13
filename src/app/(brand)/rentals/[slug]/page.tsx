import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "@phosphor-icons/react/dist/ssr";
import { db, parseJSON } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { blockedDays } from "@/lib/rentals";
import { Plate } from "@/components/ui/plate";
import { formatINR } from "@/lib/money";
import { DarkCurve } from "@/components/brand/page-hero";
import { BookingWidget } from "./booking-widget";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const it = await db.rentalItem.findUnique({ where: { slug } });
  if (!it) return {};
  return { title: `Rent the ${it.name}`, description: it.tagline, alternates: { canonical: `/rentals/${it.slug}` } };
}

export default async function RentalPage({ params }: Props) {
  const { slug } = await params;
  const it = await db.rentalItem.findUnique({ where: { slug } });
  if (!it || !it.active) notFound();
  const [blocked, user] = await Promise.all([blockedDays(it.id, it.units), getUser()]);
  const includes = parseJSON<string[]>(it.includes, []);
  const goodFor = parseJSON<string[]>(it.goodFor, []);

  return (
    <>
    <section data-theme="light" className="bg-white px-5 pb-28 pt-32 text-[#050816] md:px-8 md:pb-40 md:pt-36">
      <div className="mx-auto max-w-[1400px]">
        <Link href="/rentals" className="inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[#050816]/55 hover:text-[#1E90FF]">
          <ArrowLeft size={14} /> All rentals
        </Link>
        <div className="mt-8 grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <Plate
              src={it.image}
              alt={it.name}
              kind={it.slug}
              priority
              chamfer={false}
              className="aspect-[4/3] w-full rounded-[28px]"
              sizes="(min-width:1024px) 55vw, 100vw"
            />
            <h1 className="display-wide mt-12 text-[2.6rem] md:text-[3.8rem]">{it.name}</h1>
            <p className="mt-4 text-xl text-[#050816]/65">{it.tagline}</p>
            <div className="mt-8 max-w-[62ch] space-y-4 leading-relaxed text-[#050816]/70">
              {it.description.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="mt-14 grid gap-10 border-t border-[#050816]/10 pt-10 sm:grid-cols-2">
              <div>
                <h2 className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[#050816]/50">Included</h2>
                <ul className="mt-5 space-y-3">
                  {includes.map((x) => (
                    <li key={x} className="flex gap-3 text-[#050816]/75"><Check size={18} weight="bold" className="mt-0.5 shrink-0 text-[#1E90FF]" /> {x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[#050816]/50">Popular for</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {goodFor.map((g) => <span key={g} className="rounded-full bg-[#f2f5fa] px-3 py-1 text-sm text-[#050816]/70">{g}</span>)}
                </div>
                <dl className="mt-8 space-y-2.5 text-sm">
                  <div className="flex justify-between"><dt className="text-[#050816]/55">Day rate</dt><dd className="font-mono">{formatINR(it.dailyRate)}</dd></div>
                  <div className="flex justify-between"><dt className="text-[#050816]/55">Refundable deposit</dt><dd className="font-mono">{formatINR(it.deposit)}</dd></div>
                  <div className="flex justify-between"><dt className="text-[#050816]/55">Minimum</dt><dd>{it.minDays} day{it.minDays > 1 ? "s" : ""}</dd></div>
                </dl>
              </div>
            </div>
          </div>
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <BookingWidget
              item={{ id: it.id, name: it.name, dailyRate: it.dailyRate, deposit: it.deposit, minDays: it.minDays, units: it.units }}
              blocked={blocked}
              user={user ? { name: user.name, email: user.email, phone: user.phone ?? "" } : null}
            />
          </div>
        </div>
      </div>
    </section>
    <DarkCurve />
    </>
  );
}
