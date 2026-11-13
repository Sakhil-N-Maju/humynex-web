"use client";

import { Fragment } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

/**
 * A gear shaped to read as a lowercase "o": a thick ring like the letter's
 * stroke, with short, chunky teeth so it doesn't turn into a sunburst.
 * Outer radius 50, ring from 23 to 41, 8 teeth.
 */
function letterGearPath() {
  const N = 8, tip = 50, root = 40, bore = 23;
  const tau = (Math.PI * 2) / N;
  const p = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
  let d = "";
  for (let i = 0; i < N; i++) {
    const c = i * tau - Math.PI / 2;
    // tooth: root -> flank -> flat top -> flank -> root, tapered slightly
    const pts = [p(root, c - tau * 0.5), p(root, c - tau * 0.24), p(tip, c - tau * 0.17), p(tip, c + tau * 0.17), p(root, c + tau * 0.24)];
    d += (i === 0 ? "M " : "L ") + pts.join(" L ") + " ";
  }
  d += "Z ";
  d += `M ${bore} 0 A ${bore} ${bore} 0 1 0 ${-bore} 0 A ${bore} ${bore} 0 1 0 ${bore} 0 Z`;
  return d;
}

// computed once at module load; the shape never changes
const LETTER_GEAR = letterGearPath();

/**
 * The letter "o" drawn as a gear. It sits on the baseline at x-height, so the
 * word still reads normally, and turns slowly as the page scrolls.
 */
function GearO() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  // slow: one full turn per ~1800px of scroll, eased so it coasts to a stop
  const raw = useTransform(scrollY, (y) => y * 0.2);
  const rotate = useSpring(raw, { stiffness: 60, damping: 20, mass: 0.6 });
  return (
    <span className="relative mx-[0.02em] inline-block h-[0.66em] w-[0.66em] align-[-0.035em]" aria-hidden="true">
      <motion.svg
        viewBox="-51 -51 102 102"
        className="absolute inset-0 h-full w-full"
        style={{ rotate: reduce ? 0 : rotate }}
      >
        <path d={LETTER_GEAR} fillRule="evenodd" fill="#1E90FF" />
      </motion.svg>
    </span>
  );
}

export function GearHeading({
  text,
  className,
  gearWords = ["robotics"],
}: {
  text: string;
  className?: string;
  /** Only "o"s inside these words (case-insensitive) become gears. */
  gearWords?: string[];
}) {
  const geared = (w: string) => gearWords.includes(w.toLowerCase().replace(/[^a-z]/g, ""));
  // Words are kept whole (nowrap) so a gear never splits a word across lines.
  const words = text.split(" ");
  return (
    <h1 className={className} aria-label={text}>
      <span aria-hidden="true">
        {words.map((word, wi) => (
          <Fragment key={wi}>
            <span className="whitespace-nowrap">
              {geared(word)
                ? word.split(/([oO])/).map((p, i) => (/^[oO]$/.test(p) ? <GearO key={i} /> : <Fragment key={i}>{p}</Fragment>))
                : word}
            </span>
            {wi < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </h1>
  );
}
