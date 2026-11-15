"use client";

import { useRef } from "react";
import Link from "next/link";
import clsx from "clsx";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Plate } from "@/components/ui/plate";
import { ModelViewer, type MaterialTint } from "./model-viewer";

export type RentalRowData = {
  slug: string;
  name: string;
  tagline: string;
  /** Phrase inside the tagline to set in brand blue. Ignored if not found. */
  highlight?: string;
  blurb: string;
  dailyRate: string;
  goodFor: string[];
  image: string | null;
  model?: string;
  tint?: Record<string, MaterialTint>;
};

/** Drifts with the section's scroll progress: higher speed travels further. */
function Drift({
  progress,
  speed,
  className,
  children,
}: {
  progress: MotionValue<number>;
  speed: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const y = useTransform(progress, [0, 1], [speed, -speed]);
  return (
    <motion.div style={reduce ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  );
}

function Tagline({ text, highlight }: { text: string; highlight?: string }) {
  const at = highlight ? text.toLowerCase().indexOf(highlight.toLowerCase()) : -1;
  if (!highlight || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="text-[#1E90FF]">{text.slice(at, at + highlight.length)}</span>
      {text.slice(at + highlight.length)}
    </>
  );
}

/**
 * One rental as its own full-width section. Rows alternate dark and light,
 * and alternate which side the model sits on. While the row crosses the
 * screen the model and each line of text move at their own speed, so the
 * layout spreads and settles like layers.
 */
export function RentalRow({ item, index }: { item: RentalRowData; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const flip = index % 2 === 1;
  const light = index % 2 === 1;
  const muted = light ? "text-[#050816]/65" : "text-white/65";

  return (
    <div className={clsx(light && "px-3 md:px-4")}>
      <section
        ref={ref}
        data-theme={light ? "light" : "dark"}
        aria-label={item.name}
        className={clsx(
          "relative mx-auto overflow-hidden px-5 py-28 md:px-12 md:py-44",
          light ? "my-10 max-w-[1500px] rounded-[32px] bg-white text-[#050816] md:my-16 md:rounded-[48px]" : "text-white",
        )}
      >
        <div className={clsx("mx-auto grid max-w-[1400px] items-center gap-12 lg:gap-16", flip ? "lg:grid-cols-[1fr_1.15fr]" : "lg:grid-cols-[1.15fr_1fr]")}>
          <Drift progress={scrollYProgress} speed={60} className={clsx("relative", flip && "lg:order-2")}>
            <div className="relative mx-auto aspect-square w-full max-w-[620px]">
              <div
                aria-hidden="true"
                className={clsx(
                  "absolute inset-[12%] rounded-full",
                  light
                    ? "bg-[radial-gradient(closest-side,rgb(30_144_255/0.16),transparent)]"
                    : "bg-[radial-gradient(closest-side,rgb(30_144_255/0.26),transparent)]",
                )}
              />
              {item.model ? (
                <ModelViewer src={item.model} label={item.name} tint={item.tint} tone={light ? "light" : "dark"} className="absolute inset-0" />
              ) : (
                <div className="absolute inset-[8%] overflow-hidden rounded-[28px]">
                  <Plate src={item.image} alt={item.name} kind={item.slug} chamfer={false} className="h-full w-full" sizes="(min-width:1024px) 50vw, 100vw" />
                </div>
              )}
            </div>
          </Drift>

          <div className={clsx(flip && "lg:order-1")}>
            <Drift progress={scrollYProgress} speed={20}>
              <p className={clsx("font-mono text-[0.72rem] uppercase tracking-[0.1em]", light ? "text-[#050816]/45" : "text-white/45")}>
                {String(index + 1).padStart(2, "0")} / Rental
              </p>
            </Drift>
            <Drift progress={scrollYProgress} speed={40}>
              <h2 className="display-wide mt-4 text-[2.6rem] md:text-[3.8rem]">{item.name}</h2>
            </Drift>
            <Drift progress={scrollYProgress} speed={55}>
              <p className="mt-5 max-w-[30ch] text-xl font-medium leading-snug md:text-2xl">
                <Tagline text={item.tagline} highlight={item.highlight} />
              </p>
            </Drift>
            <Drift progress={scrollYProgress} speed={70}>
              <p className={clsx("mt-5 max-w-[46ch] text-lg leading-relaxed", muted)}>{item.blurb}</p>
            </Drift>
            {item.goodFor.length > 0 && (
              <Drift progress={scrollYProgress} speed={85}>
                <ul className="mt-7 flex flex-wrap gap-2">
                  {item.goodFor.map((g) => (
                    <li
                      key={g}
                      className={clsx("rounded-full border px-3 py-1 text-sm", light ? "border-[#050816]/15 text-[#050816]/70" : "border-white/15 text-white/70")}
                    >
                      {g}
                    </li>
                  ))}
                </ul>
              </Drift>
            )}
            <Drift progress={scrollYProgress} speed={100}>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link
                  href={`/rentals/${item.slug}`}
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#1E90FF] px-6 font-semibold text-[#050816] transition-colors hover:bg-[#67D4FF]"
                >
                  View details
                  <ArrowUpRight size={16} weight="bold" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
                <span>
                  <span className="font-mono text-2xl">{item.dailyRate}</span>
                  <span className={light ? "text-[#050816]/50" : "text-white/50"}> / day</span>
                </span>
              </div>
            </Drift>
          </div>
        </div>
      </section>
    </div>
  );
}
