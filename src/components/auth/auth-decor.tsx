"use client";

import { useReducedMotion } from "motion/react";
import { gearPath, pitchR } from "@/components/fx/gear-math";

/* ---------------------------------------------------------------- gears */

// Two spur gears on one module so their teeth mesh: centres sit exactly the
// sum of the pitch radii apart, speeds are in inverse ratio to tooth counts,
// and the small gear starts with a gap facing the big gear's tooth.
const MOD = 6;
const BIG_N = 18;
const SMALL_N = 11;
const BIG_D = gearPath(BIG_N, MOD, { holes: 5 });
const SMALL_D = gearPath(SMALL_N, MOD, { holes: 0 });
const CENTRES = pitchR(BIG_N, MOD) + pitchR(SMALL_N, MOD);
const BIG_SECONDS = 24;
const SMALL_SECONDS = (BIG_SECONDS * SMALL_N) / BIG_N;

/**
 * A meshing gear pair. `angle` is the direction (degrees) from the big gear
 * to the small one. Rotation uses SVG's own clock, so both gears always start
 * together and stay in mesh.
 */
export function GearPair({ angle = -20, className, flip }: { angle?: number; className?: string; flip?: boolean }) {
  const reduce = useReducedMotion();
  const rad = (angle * Math.PI) / 180;
  const sx = CENTRES * Math.cos(rad);
  const sy = CENTRES * Math.sin(rad);
  // phase: a big-gear tooth points at the small gear, a small-gear gap points back
  const bigPhase = angle;
  const smallStep = 360 / SMALL_N;
  const smallPhase = angle + 180 - smallStep / 2;

  const rb = pitchR(BIG_N, MOD) + MOD;
  const rs = pitchR(SMALL_N, MOD) + MOD;
  const minX = Math.min(-rb, sx - rs);
  const maxX = Math.max(rb, sx + rs);
  const minY = Math.min(-rb, sy - rs);
  const maxY = Math.max(rb, sy + rs);

  const spin = (from: number, dir: 1 | -1, dur: number) =>
    reduce ? null : (
      <animateTransform
        attributeName="transform"
        type="rotate"
        from={`${from} 0 0`}
        to={`${from + 360 * dir} 0 0`}
        dur={`${dur}s`}
        repeatCount="indefinite"
      />
    );

  return (
    <svg
      aria-hidden="true"
      viewBox={`${minX - 2} ${minY - 2} ${maxX - minX + 4} ${maxY - minY + 4}`}
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <g transform={`rotate(${bigPhase})`}>
        {spin(bigPhase, 1, BIG_SECONDS)}
        <path d={BIG_D} fillRule="evenodd" fill="#1E90FF" />
      </g>
      <circle r={MOD * 1.1} fill="#050816" />
      <circle r={MOD * 0.45} fill="#67D4FF" />
      <g transform={`translate(${sx} ${sy})`}>
        <g transform={`rotate(${smallPhase})`}>
          {spin(smallPhase, -1, SMALL_SECONDS)}
          <path d={SMALL_D} fillRule="evenodd" fill="#67D4FF" />
        </g>
        <circle r={MOD * 0.9} fill="#050816" />
        <circle r={MOD * 0.35} fill="#1E90FF" />
      </g>
    </svg>
  );
}
