"use client";

import { useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { CountUp } from "@/components/ui/count-up";

type Fact = { value: number; suffix: string; label: string };
type Client = { name: string; logo: string };
type Badge = { label: string; detail: string };

const WIDE = "(min-width: 768px)";
function useWide() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(WIDE);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(WIDE).matches,
    () => true,
  );
}

/** Moves at its own speed relative to the scroll, for depth. */
function Drift({
  progress,
  speed,
  className,
  children,
}: {
  progress: MotionValue<number>;
  // px of extra travel across the section: positive rises faster than the
  // page, negative lags behind it
  speed: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  // on phones the items stack in one column, so big speed differences would
  // slide them over each other; keep only a gentle drift there
  const wide = useWide();
  const s = wide ? speed : speed * 0.15;
  const y = useTransform(progress, [0, 1], [s, -s]);
  return (
    <motion.div style={reduce ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  );
}

function Stat({ fact, size, delay = 0 }: { fact: Fact; size: string; delay?: number }) {
  return (
    <div>
      <p className={`display leading-[0.85] tracking-[-0.05em] ${size}`}>
        <CountUp to={fact.value} duration={2.2} delay={delay} />
        {fact.suffix && <span className="text-[#1E90FF]">{fact.suffix}</span>}
      </p>
      <p className="mt-3 text-lg font-medium text-[#050816]/70">{fact.label}</p>
    </div>
  );
}

/**
 * Trust section on white. The white sheet rises faster than the page as it
 * meets the navy services above (the light/dark parallax), and each fact drifts
 * at a different speed inside it.
 */
export function TrustSection({
  facts,
  clients,
  badges,
  cta = { href: "/about", label: "Meet the team" },
}: {
  facts: Fact[];
  clients: Client[];
  badges: Badge[];
  /** Bottom-right call to action. */
  cta?: { href: string; label: string };
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // entry: sheet climbs from 22vh below its resting place as it enters
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start 15%"] });
  const sheetY = useTransform(enter, [0, 1], ["22vh", "0vh"]);
  // inside: drift while the section crosses the viewport
  const { scrollYProgress: across } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const [years, engineers, patents] = facts;

  return (
    <motion.section
      ref={ref}
      aria-labelledby="trust-title"
      data-theme="light"
      style={reduce ? undefined : { y: sheetY }}
      className="relative z-10 mt-24 rounded-[32px] bg-white text-[#050816] md:mt-40 md:rounded-[48px]"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-36">
        <div className="grid gap-y-16 md:grid-cols-12 md:gap-x-8">
          {/* heading, top left */}
          <Drift progress={across} speed={30} className="md:col-span-5">
            <h2 id="trust-title" className="display max-w-[14ch] text-4xl md:text-5xl">
              The team behind every build.
            </h2>
            <p className="mt-4 max-w-[34ch] text-lg text-[#050816]/65">
              Engineers who design, build and test every machine in our own lab.
            </p>
          </Drift>

          {/* patents, top right, big */}
          {patents && (
            <Drift progress={across} speed={140} className="md:col-span-5 md:col-start-8 md:mt-10 md:text-right">
              <Stat fact={patents} size="text-[6.5rem] md:text-[9.5rem]" delay={0.2} />
            </Drift>
          )}

          {/* engineers, the hero number */}
          {engineers && (
            <Drift progress={across} speed={-20} className="md:col-span-7 md:-mt-6">
              <Stat fact={engineers} size="text-[8rem] text-[#1E90FF] md:text-[17rem]" />
            </Drift>
          )}

          {/* side notes, offset right */}
          <Drift progress={across} speed={-30} className="space-y-10 md:col-span-4 md:col-start-9 md:self-end md:pb-10">
            <div className="border-l-2 border-[#1E90FF] pl-5">
              <p className="display text-2xl">Razorpay</p>
              <p className="mt-1 text-[#050816]/65">Secure UPI, card and net banking on every order</p>
            </div>
            <div className="border-l-2 border-[#050816] pl-5">
              <p className="display text-2xl">Kalady, Kerala</p>
              <p className="mt-1 text-[#050816]/65">Designed, built and tested in-house</p>
            </div>
          </Drift>

          {/* years, mid, offset inward */}
          {years && (
            <Drift progress={across} speed={170} className="md:col-span-5 md:col-start-4 md:mt-24">
              <Stat fact={years} size="text-[6rem] md:text-[8rem]" delay={0.35} />
            </Drift>
          )}

          {/* bottom right: link to the team */}
          <Drift progress={across} speed={-20} className="md:col-span-3 md:col-start-10 md:flex md:items-end md:justify-end md:pb-0">
            <Link
              href={cta.href}
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#1E90FF] pl-7 pr-2 text-lg font-semibold text-[#050816] transition-colors hover:bg-[#67D4FF]"
            >
              {cta.label}
              <span className="grid size-10 place-items-center rounded-full bg-[#050816] text-white transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight size={18} weight="bold" />
              </span>
            </Link>
          </Drift>
        </div>

        {clients.length > 0 && (
          <div className="mt-24 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 border-t border-[#050816]/10 pt-12">
            {clients.map((c) => (
              <Image key={c.name} src={c.logo} alt={c.name} width={140} height={40} className="h-8 w-auto opacity-70 grayscale" />
            ))}
          </div>
        )}
        {badges.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-3">
            {badges.map((b) => (
              <li key={b.label} className="rounded-full border border-[#050816]/15 px-3 py-1.5 text-sm">
                {b.label} <span className="text-[#050816]/55">{b.detail}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.section>
  );
}
