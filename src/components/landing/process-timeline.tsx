"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import clsx from "clsx";

export type Step = { title: string; body: string; time: string };

// SVG coordinate space: 1000 units wide, ROW units per step. The SVG is
// stretched to the container (preserveAspectRatio="none"); the stroke uses
// non-scaling-stroke so it stays crisp at any size.
const ROW = 300;
const LEFT_X = 90;
const RIGHT_X = 910;

function serpentine(n: number) {
  const pts = Array.from({ length: n }, (_, i) => ({ x: i % 2 === 0 ? LEFT_X : RIGHT_X, y: ROW * (i + 0.5) }));
  let d = `M ${pts[0].x} 0 L ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < n; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const k = ROW * 0.98; // stay vertical past the text, swing across in the gap between steps
    d += ` C ${a.x} ${a.y + k} ${b.x} ${b.y - k} ${b.x} ${b.y}`;
  }
  const last = pts[n - 1];
  d += ` L ${last.x} ${ROW * n}`;
  return d;
}

/**
 * A curved timeline that snakes left, right, left... down the section.
 * The line draws itself as you scroll, and each stop appears as the line
 * reaches it. Text always sits on the inner side of its stop.
 */
export function ProcessTimeline({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const n = steps.length;
  const d = serpentine(n);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 55%"] });
  const drawn = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <div
      ref={ref}
      className="relative"
      style={{ height: `calc(${n} * var(--row))`, ["--row" as string]: "clamp(340px, 42vh, 420px)" }}
    >
      <svg viewBox={`0 0 1000 ${ROW * n}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {/* faint track, then the drawn line on top */}
        <path d={d} fill="none" stroke="rgb(5 8 22 / 0.1)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        <motion.path
          d={d}
          fill="none"
          stroke="#1E90FF"
          strokeWidth={3}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: reduce ? 1 : drawn }}
        />
      </svg>

      <ol className="absolute inset-0">
        {steps.map((s, i) => {
          const left = i % 2 === 0;
          const xPct = ((left ? LEFT_X : RIGHT_X) / 1000) * 100;
          return (
            <li key={s.title} className="absolute inset-x-0" style={{ top: `calc(${i + 0.5} * var(--row))` }}>
              {/* stop */}
              <motion.span
                aria-hidden="true"
                initial={reduce ? false : { scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "0px 0px -35% 0px" }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-[#1E90FF] bg-white"
                style={{ left: `${xPct}%` }}
              >
                <span className="size-3 rounded-full bg-[#1E90FF]" />
              </motion.span>

              {/* text on the inner side of the stop */}
              <motion.div
                initial={reduce ? false : { opacity: 0, x: left ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px 0px -35% 0px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className={clsx("absolute w-[min(62%,30rem)] -translate-y-1/2", left ? "text-left" : "text-right")}
                style={left ? { left: `calc(${xPct}% + 2.5rem)` } : { right: `calc(${100 - xPct}% + 2.5rem)` }}
              >
                <span className="font-mono text-sm text-[#1E90FF]">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="display mt-1 text-2xl md:text-[2rem]">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-[#050816]/70 md:text-lg">{s.body}</p>
                <p className="mt-3 inline-block rounded-full border border-[#1E90FF]/40 px-3 py-1 text-sm text-[#0f5fcc]">{s.time}</p>
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
