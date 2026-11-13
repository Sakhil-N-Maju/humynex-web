import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { db, parseJSON } from "@/lib/db";
import { Plate } from "@/components/ui/plate";
import { Reveal } from "@/components/fx/reveal";
import { formatINR } from "@/lib/money";
import { PageHero, DarkBand, WhiteSheet, SectionLabel, btnBlue } from "@/components/brand/page-hero";

export const metadata: Metadata = {
  title: "Rent a robot for your event",
  description: "Rent a robot dog, serving robot or Bumblebee costume for college fests, weddings and launches in Kerala. Operator included.",
  alternates: { canonical: "/rentals" },
};

const STEPS = [
  ["Book", "Pick your dates and pay the rent plus a refundable deposit online."],
  ["Plan", "We call within a working day to confirm timings, venue access and power."],
  ["Show", "Our operator arrives early, runs the robot, and takes it home after. Deposit refunded within 3 days."],
];

export default async function RentalsPage() {
  const items = await db.rentalItem.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  const [lead, ...rest] = items;

  return (
    <>
      <PageHero
        eyebrow="Rentals · Operator included"
        title="Robots for hire, for your next event."
        sub="For fests, weddings, launches and science fairs. An operator sets up, runs the show and packs up. Pick dates, pay online, and we'll call to plan the day."
      >
        <a href="#fleet" className={btnBlue}>See the fleet</a>
      </PageHero>

      <DarkBand curve id="fleet" label="The fleet">
        <div className="mx-auto max-w-[1400px]">
          <SectionLabel n="01" dark>The fleet</SectionLabel>

          {lead && (
            <Reveal className="mt-10">
              <Link
                data-theme="light"
                href={`/rentals/${lead.slug}`}
                className="group grid gap-3 rounded-[32px] bg-white p-3 text-[#050816] lg:grid-cols-[1.4fr_1fr]"
              >
                <div className="overflow-hidden rounded-[24px]">
                  <Plate
                    src={lead.image}
                    alt={lead.name}
                    kind={lead.slug}
                    priority
                    chamfer={false}
                    className="aspect-[16/10] w-full transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(min-width:1024px) 60vw, 100vw"
                  />
                </div>
                <div className="flex flex-col p-5 md:p-8">
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-[#1E90FF]">Most booked</span>
                  <h2 className="display-wide mt-3 text-[2.4rem] md:text-[3.2rem]">{lead.name}</h2>
                  <p className="mt-3 text-lg text-[#050816]/65">{lead.tagline}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {parseJSON<string[]>(lead.goodFor, []).map((g) => (
                      <span key={g} className="rounded-full bg-[#f2f5fa] px-3 py-1 text-sm text-[#050816]/70">{g}</span>
                    ))}
                  </div>
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-6 pt-10">
                    <div>
                      <span className="font-mono text-3xl">{formatINR(lead.dailyRate)}</span>
                      <span className="text-[#050816]/50"> / day</span>
                    </div>
                    <span className={btnBlue}>
                      Check dates <ArrowUpRight size={16} weight="bold" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          )}

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((it, i) => (
              <Reveal key={it.id} delay={(i % 3) * 0.06} className="h-full">
                <Link data-theme="light" href={`/rentals/${it.slug}`} className="group flex h-full flex-col rounded-[24px] bg-white p-3 text-[#050816]">
                  <div className="overflow-hidden rounded-[16px]">
                    <Plate
                      src={it.image}
                      alt={it.name}
                      kind={it.slug}
                      chamfer={false}
                      className="aspect-[4/3] w-full transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="(min-width:1280px) 33vw, 50vw"
                    />
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-4 px-2 pb-2 pt-5">
                    <div>
                      <h2 className="display text-2xl group-hover:text-[#1E90FF]">{it.name}</h2>
                      <p className="mt-1.5 text-[#050816]/60">{it.tagline}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="block font-mono text-lg">{formatINR(it.dailyRate)}</span>
                      <span className="text-xs text-[#050816]/50">per day</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </DarkBand>

      <div className="px-3 md:px-4">
        <WhiteSheet label="How renting works" className="max-w-[1500px]">
          <div className="mx-auto max-w-[1300px]">
            <div className="text-center">
              <SectionLabel n="02">How it works</SectionLabel>
              <h2 className="display-wide mx-auto mt-5 max-w-[16ch] text-[2.4rem] md:text-[4rem]">Three steps to a robot at your event.</h2>
            </div>
            <ol className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map(([h, b], i) => (
                <Reveal key={h} as="li" delay={i * 0.08}>
                  <span className="font-mono text-sm text-[#1E90FF]">0{i + 1}</span>
                  <h3 className="display mt-3 border-t border-[#050816]/12 pt-5 text-3xl">{h}</h3>
                  <p className="mt-3 max-w-[36ch] leading-relaxed text-[#050816]/65">{b}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </WhiteSheet>
      </div>
    </>
  );
}
