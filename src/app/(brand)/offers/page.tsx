import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { getUser } from "@/lib/auth";
import { formatINR } from "@/lib/money";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import clsx from "clsx";
import { Reveal } from "@/components/fx/reveal";
import { PageHero, DarkBand, WhiteSheet, SectionLabel, btnBlue, btnNavy } from "@/components/brand/page-hero";
import { CopyCode } from "./copy-code";

export const metadata: Metadata = {
  title: "Offers and reward points",
  description: "Current offer codes for robotics parts, robot rentals and 3D printing, plus how Humynex reward points work.",
  alternates: { canonical: "/offers" },
};

const WHERE: Record<string, { label: string; href: string }> = {
  SHOP: { label: "Parts and kits", href: "/shop" },
  RENTAL: { label: "Robot rentals", href: "/rentals" },
  PRINT: { label: "3D printing", href: "/print" },
  ALL: { label: "Everything", href: "/shop" },
};

export default async function OffersPage() {
  const now = new Date();
  const [offers, rewards, user] = await Promise.all([
    db.coupon.findMany({
      where: {
        active: true,
        showOnSite: true,
        OR: [{ endsAt: null }, { endsAt: { gte: now } }],
        AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }],
      },
      orderBy: { createdAt: "asc" },
    }),
    getSetting("rewards"),
    getUser(),
  ]);
  const live = offers.filter((o) => o.usageLimit === null || o.usedCount < o.usageLimit);

  const perks = [
    ["When you join", `${rewards.signupBonus} points, straight away`],
    ["Every ₹100 you pay", `${rewards.pointsPer100} points on parts, rentals and prints`],
    ["Each point is worth", "₹1 off at checkout"],
    ["Pay with points", `Up to ${rewards.maxRedeemPct}% of any order`],
  ];

  return (
    <>
      <PageHero
        eyebrow={`Offers · ${live.length} live`}
        title="Offers that are live right now."
        sub="Copy a code and paste it at checkout. One code per order, and codes stack with reward points."
      />

      <DarkBand curve label="Live offers">
        <div className="mx-auto max-w-[1400px]">
          <SectionLabel n="01" dark>Offer codes</SectionLabel>
          {live.length === 0 ? (
            <p className="display mt-10 max-w-[24ch] text-3xl text-white/80">No public offers this week. Members still earn points on every order.</p>
          ) : (
            <ul className="mt-10 grid gap-5 md:grid-cols-2">
              {live.map((o, i) => {
                const lead = i === 0;
                return (
                  <Reveal
                    as="li"
                    key={o.id}
                    theme="light"
                    delay={lead ? 0 : (i % 2) * 0.06}
                    className={clsx(
                      "relative flex flex-col justify-between gap-10 rounded-[28px] bg-white p-7 text-[#050816] md:p-9",
                      lead && "md:col-span-2 md:flex-row md:items-end",
                    )}
                  >
                    <div>
                      <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[#1E90FF]">
                        {WHERE[o.appliesTo]?.label ?? o.appliesTo}
                        {o.membersOnly ? " · members only" : ""}
                      </span>
                      <h2 className={clsx("display-wide mt-3", lead ? "max-w-[16ch] text-[2.4rem] md:text-[3.6rem]" : "text-[1.9rem]")}>{o.title}</h2>
                      <p className="mt-3 max-w-[52ch] text-[#050816]/65">{o.description}</p>
                      <p className="mt-4 text-sm text-[#050816]/45">
                        {o.minOrder > 0 ? `Minimum ${formatINR(o.minOrder)}. ` : ""}
                        {o.endsAt ? `Ends ${o.endsAt.toLocaleDateString("en-IN", { day: "numeric", month: "long" })}.` : "No end date."}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <CopyCode code={o.code} />
                      <Link href={WHERE[o.appliesTo]?.href ?? "/shop"} className={btnNavy}>
                        Use it <ArrowUpRight size={16} weight="bold" />
                      </Link>
                    </div>
                  </Reveal>
                );
              })}
            </ul>
          )}
        </div>
      </DarkBand>

      <div className="px-3 md:px-4">
        <WhiteSheet label="Reward points" className="max-w-[1500px]">
          <div className="mx-auto grid max-w-[1300px] gap-14 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <SectionLabel n="02">Rewards</SectionLabel>
              <h2 className="display-wide mt-5 text-[2.4rem] md:text-[3.6rem]">Reward points.</h2>
              {!user && (
                <Link href="/signup" className={`${btnBlue} mt-8`}>Join and get {rewards.signupBonus} points</Link>
              )}
              {user && (
                <p className="mt-6 text-lg text-[#050816]/65">
                  You have <span className="font-mono text-[#1E90FF]">{user.points}</span> points.{" "}
                  <Link href="/account" className="text-[#1E90FF] hover:underline">See history</Link>
                </p>
              )}
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              {perks.map(([k, v], i) => (
                <Reveal key={k} delay={(i % 2) * 0.06} className="rounded-[24px] bg-[#f2f5fa] p-7">
                  <dt className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[#050816]/50">{k}</dt>
                  <dd className="display mt-3 text-2xl">{v}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </WhiteSheet>
      </div>
    </>
  );
}
