"use client";

import { FitImage } from "@/components/ui/fit-image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import clsx from "clsx";
import { useMediaQuery } from "@/lib/use-client-state";

export type Work = { slug: string; title: string; year: number; cover: string | null };

// Dummy photography (Unsplash, stored in /public/placeholders) until real
// project covers are uploaded in Admin > Projects. Slot n uses work-n.jpg.
const placeholder = (slot: number) => `/placeholders/work-${slot}.jpg`;

function Card({ work, slot, className, ratio }: { work: Work; slot: number; className?: string; ratio: string }) {
  const [w, h] = ratio === "tall" ? [900, 1200] : ratio === "square" ? [1000, 1000] : [900, 1100];
  return (
    <Link href={`/projects/${work.slug}`} className={clsx("group block", className)}>
      <div className="relative overflow-clip bg-white/5" style={{ aspectRatio: `${w} / ${h}` }}>
        <FitImage
          src={work.cover ?? placeholder(slot)}
          alt={work.title}
          sizes="(min-width: 768px) 30vw, 90vw"
          className="mono transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <p className="mt-3 font-mono text-[0.72rem] uppercase tracking-[0.06em] text-white/75 transition-colors group-hover:text-[#67D4FF]">
        {work.title} ({work.year})
      </p>
    </Link>
  );
}

function Column({ y, className, children }: { y?: MotionValue<number>; className?: string; children: React.ReactNode }) {
  return (
    <motion.div style={y ? { y } : undefined} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * "Our works": the heading sits pinned in the middle of the screen, shown on
 * its own first. Six projects then scroll up over it in three columns at
 * different speeds (right fastest, left slowest), and the heading dims while
 * they pass.
 */
export function WorksSection({ works }: { works: Work[] }) {
  const grid = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 768px)");
  const parallax = desktop && !reduce;

  // across the whole grid's journey through the viewport
  const { scrollYProgress } = useScroll({ target: grid, offset: ["start end", "end start"] });
  const leftY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, -380]);
  const rightY = useTransform(scrollYProgress, [0, 1], [0, -760]);

  // dim the heading once the first images reach it
  const { scrollYProgress: arrive } = useScroll({ target: grid, offset: ["start end", "start 35%"] });
  const headingOpacity = useTransform(arrive, [0.35, 1], [1, 0.22]);

  // Reference order: right column top, then middle, then left, repeated.
  const [a, b, c, d, e, f] = works;

  return (
    <section id="work" aria-labelledby="work-title" data-theme="dark" className="relative scroll-mt-0">
      {/* Pinned heading behind the projects */}
      <div className="sticky top-0 grid h-[100dvh] place-items-center overflow-clip">
        <motion.h2
          id="work-title"
          style={parallax ? { opacity: headingOpacity } : undefined}
          className="display-wide select-none text-center text-[clamp(4.5rem,15vw,15rem)] leading-[0.9] text-white"
        >
          Our works
        </motion.h2>
      </div>

      {/* Projects, layered above the heading. Start one screen down so the
          heading is seen alone first. */}
      <div className="relative z-10 -mt-[100dvh] px-5 pb-[30vh] pt-[100dvh] md:px-[1.5vw] md:pb-[45vh]">
        {/* motion is measured from the image columns, not the spacer above them */}
        <div ref={grid} className="md:flex md:items-start md:justify-between">
        {/* left: slowest */}
        <Column y={parallax ? leftY : undefined} className="space-y-16 md:w-[24%] md:space-y-0">
          {c && <Card work={c} slot={3} ratio="tall" className="md:mt-[38vh] md:w-[68%]" />}
          {f && <Card work={f} slot={6} ratio="portrait" className="md:mt-[34vh] md:w-[92%]" />}
        </Column>

        {/* middle: medium */}
        <Column y={parallax ? midY : undefined} className="mt-16 space-y-16 md:mt-0 md:w-[34%] md:space-y-0">
          {b && <Card work={b} slot={2} ratio="portrait" className="md:ml-[6%] md:mt-[16vh] md:w-[76%]" />}
          {e && <Card work={e} slot={5} ratio="tall" className="md:ml-[24%] md:mt-[40vh] md:w-[68%]" />}
        </Column>

        {/* right: fastest */}
        <Column y={parallax ? rightY : undefined} className="mt-16 space-y-16 md:mt-0 md:w-[25%] md:space-y-0">
          {a && <Card work={a} slot={1} ratio="tall" className="md:w-full" />}
          {d && <Card work={d} slot={4} ratio="square" className="md:ml-[4%] md:mt-[26vh] md:w-[92%]" />}
        </Column>
        </div>
      </div>
    </section>
  );
}
