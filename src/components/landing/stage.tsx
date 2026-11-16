"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, useMotionTemplate } from "motion/react";
import { GearHeading } from "./gear-heading";
import { useMediaQuery } from "@/lib/use-client-state";

// Where the screen starts: its top edge sits 86% down the viewport,
// inset from the sides like a device on a desk.
const START_TOP = 86; // vh
const START_SIDE = 5; // vw
const START_RADIUS = 28; // px

/** What shows inside the screen: the section heading. The service cards stack in right below it. */
function ServicesIntro() {
  return (
    <div className="mx-auto flex h-full max-w-[1400px] flex-col items-center px-5 pb-10 pt-44 text-center md:px-[max(2.5rem,7vw)] md:pt-24">
      <h2 className="display max-w-[16ch] text-[2.3rem] text-white md:text-6xl">Everything we can build and do for you.</h2>
      <p className="mt-4 max-w-[40rem] text-white/70 md:text-lg">
        Custom robots and robotics labs first. Parts, rentals and 3D printing for when you need them fast.
      </p>
    </div>
  );
}

export function Stage({
  headline,
  sub,
}: {
  headline: string;
  sub: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // The scroll-driven screen runs on tablet and up; phones get a stacked layout.
  const immersive = useMediaQuery("(min-width: 768px)");

  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  // 0 -> 0.85 the screen grows to fill the viewport, the rest is a short hold
  const e = useTransform(scrollYProgress, [0, 0.85], [0, 1], { clamp: true });
  const top = useTransform(e, (v) => START_TOP * (1 - v));
  const side = useTransform(e, (v) => START_SIDE * (1 - v));
  const radius = useTransform(e, (v) => START_RADIUS * (1 - v));
  // only the top corners are rounded; the bottom edge stays square
  const clip = useMotionTemplate`inset(${top}vh ${side}vw 0vh ${side}vw round ${radius}px ${radius}px 0px 0px)`;
  const innerY = useMotionTemplate`${top}vh`;
  // hero copy drifts up and fades as the screen takes over
  const heroY = useTransform(e, [0, 1], [0, reduce ? 0 : -90]);
  const heroOpacity = useTransform(e, [0, 0.55], [1, 0]);
  // the services heading stays hidden while the screen is small, so the hero
  // shows only the dark panel; it fades in as the panel grows
  const introOpacity = useTransform(e, [0.3, 0.7], [0, 1]);

  return (
    <div ref={track} id="top" className="relative md:h-[230vh]">
      <div data-theme="light" className="relative bg-white md:sticky md:top-0 md:h-[100dvh] md:overflow-hidden">
        {/* Hero copy: white and navy only */}
        <motion.div
          style={immersive ? { y: heroY, opacity: heroOpacity } : undefined}
          className="flex min-h-[100svh] flex-col items-center justify-center px-5 pb-[18vh] pt-40 text-center text-[#050816] md:absolute md:inset-x-0 md:top-0 md:h-[86vh] md:min-h-0 md:pb-0 md:pt-36"
        >
          <GearHeading
            text={headline}
            className="display-wide max-w-[16ch] text-[2.5rem] leading-[1] sm:text-[3.4rem] md:max-w-[22ch] md:text-[clamp(3rem,5.2vw,5.4rem)]"
          />
          <p className="mt-8 max-w-[40rem] text-[1.05rem] leading-relaxed text-[#050816]/75 md:mt-10 md:text-lg">{sub}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:mt-14">
            <a
              href="/contact"
              className="inline-flex h-12 items-center rounded-full bg-[#1E90FF] px-6 font-semibold text-white transition-[transform,background-color] hover:bg-[#1A7FE6] active:scale-[0.98]"
            >
              Request a quote
            </a>
          </div>
        </motion.div>

        {/* The screen. On desktop it's clipped to a device-like panel that
            grows with scroll; inside it is the real services section. */}
        <motion.section
          id="services"
          aria-labelledby="services-title"
          data-theme="dark"
          style={immersive ? { clipPath: clip } : undefined}
          className="relative -mt-[16vh] rounded-t-[28px] bg-[#050816] md:absolute md:inset-0 md:mt-0 md:rounded-none md:[clip-path:inset(86vh_5vw_0vh_5vw_round_28px_28px_0_0)]"
        >
          <motion.div style={immersive ? { y: innerY, opacity: introOpacity } : undefined} className="md:h-[100dvh] md:opacity-0 md:[transform:translateY(86vh)]">
            <span id="services-title" className="sr-only">Services</span>
            <ServicesIntro />
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
