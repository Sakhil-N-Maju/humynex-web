import type { Metadata } from "next";
import { db, parseJSON } from "@/lib/db";
import { RentalRow, type RentalRowData } from "@/components/rentals/rental-row";
import { Reveal } from "@/components/fx/reveal";
import { formatINR } from "@/lib/money";
import { RENTAL_MODELS, RENTAL_TINTS } from "@/lib/rental-models";
import { PageHero, DarkBand, WhiteSheet, SectionLabel, btnBlue } from "@/components/brand/page-hero";

export const metadata: Metadata = {
  title: "Rent a robot for your event",
  description: "Rent a robot dog, serving robot or Bumblebee costume for college fests, weddings and launches in Kerala. Operator included.",
  alternates: { canonical: "/rentals" },
};

// Rentals kept off this page for now (still in admin and reachable by link).
const HIDDEN = new Set(["ixi-trolley-fleet", "stardust-rover-demo"]);

// The key phrase in each tagline, set in brand blue.
const HIGHLIGHTS: Record<string, string> = {
  "robot-dog": "dances on cue",
  "serving-robot": "mapped route",
  "bumblebee-costume": "wearable robot suit",
  "kuka-robotic-arm": "industrial-style arm",
  "ixi-trolley-fleet": "follow guests",
  "stardust-rover-demo": "live camera feed",
};


function firstSentences(text: string, n: number) {
  const parts = text.match(/[^.!?]+[.!?]+/g);
  return parts ? parts.slice(0, n).join("").trim() : text;
}

const STEPS = [
  ["Book", "Pick your dates and pay the rent plus a refundable deposit online."],
  ["Plan", "We call within a working day to confirm timings, venue access and power."],
  ["Show", "Our operator arrives early, runs the robot, and takes it home after. Deposit refunded within 3 days."],
];

export default async function RentalsPage() {
  const items = await db.rentalItem.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  const rows: RentalRowData[] = items.filter((it) => !HIDDEN.has(it.slug)).map((it) => ({
    slug: it.slug,
    name: it.name,
    tagline: it.tagline,
    // first paragraph only, kept short
    blurb: firstSentences(it.description.split(/\n\s*\n/)[0] ?? it.tagline, 2),
    dailyRate: formatINR(it.dailyRate),
    goodFor: parseJSON<string[]>(it.goodFor, []).slice(0, 3),
    image: it.image,
    model: RENTAL_MODELS[it.slug],
    highlight: HIGHLIGHTS[it.slug],
    tint: RENTAL_TINTS[it.slug],
  }));

  return (
    <>
      <PageHero
        eyebrow="Rentals · Operator included"
        title="Robots for hire, for your next event."
        sub="For fests, weddings, launches and science fairs. An operator sets up, runs the show and packs up. Pick dates, pay online, and we'll call to plan the day."
      >
        <a href="#fleet" className={btnBlue}>See the fleet</a>
      </PageHero>

      <DarkBand curve id="fleet" label="The fleet" className="!pb-0 md:!pb-4">
        <div className="mx-auto max-w-[1300px] text-center">
          <SectionLabel n="01" dark>The fleet</SectionLabel>
          <h2 className="display-wide mx-auto mt-5 max-w-[14ch] text-[2.6rem] md:text-[4.2rem]">Meet the robots you can book.</h2>
        </div>
      </DarkBand>

      {rows.map((r, i) => (
        <RentalRow key={r.slug} item={r} index={i} />
      ))}


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
