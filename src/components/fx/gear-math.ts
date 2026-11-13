// Spur-gear geometry for the background gear trains.
// Gears are drawn with a shared module (tooth size), so any two gears in a
// train mesh correctly when their centres sit pitchR(a) + pitchR(b) apart.

export const pitchR = (teeth: number, mod: number) => (teeth * mod) / 2;

/** SVG path for a gear centred at 0,0, with a bore and lightening holes (evenodd). */
export function gearPath(teeth: number, mod: number, opts: { holes?: number; bore?: number } = {}) {
  const r = pitchR(teeth, mod);
  const ra = r + mod; // tip
  const rf = r - 1.25 * mod; // root
  const tau = (Math.PI * 2) / teeth;
  const pt = (rad: number, a: number) => `${(rad * Math.cos(a)).toFixed(2)} ${(rad * Math.sin(a)).toFixed(2)}`;

  let d = "";
  for (let i = 0; i < teeth; i++) {
    const c = i * tau;
    const pts = [
      pt(rf, c - tau * 0.5),
      pt(rf, c - tau * 0.28),
      pt(ra, c - tau * 0.15),
      pt(ra, c + tau * 0.15),
      pt(rf, c + tau * 0.28),
    ];
    d += (i === 0 ? `M ${pts[0]} ` : `L ${pts[0]} `) + pts.slice(1).map((p) => `L ${p}`).join(" ") + " ";
  }
  d += "Z ";

  // hub bore
  const bore = opts.bore ?? Math.max(mod * 1.6, r * 0.14);
  d += circle(bore);

  // lightening holes between hub and rim, only on larger gears
  const holes = opts.holes ?? (teeth >= 24 ? 6 : teeth >= 16 ? 4 : 0);
  if (holes) {
    const inner = bore * 2.2;
    const outer = rf - mod * 1.6;
    const mid = (inner + outer) / 2;
    const hr = Math.min((outer - inner) / 2, (Math.PI * mid) / holes / 2.6);
    for (let k = 0; k < holes; k++) {
      const a = (k / holes) * Math.PI * 2 + Math.PI / holes;
      d += circle(hr, mid * Math.cos(a), mid * Math.sin(a));
    }
  }
  return d;
}

function circle(rad: number, cx = 0, cy = 0) {
  return `M ${(cx + rad).toFixed(2)} ${cy.toFixed(2)} A ${rad} ${rad} 0 1 0 ${(cx - rad).toFixed(2)} ${cy.toFixed(2)} A ${rad} ${rad} 0 1 0 ${(cx + rad).toFixed(2)} ${cy.toFixed(2)} Z `;
}

export type GearSpec = {
  teeth: number;
  /** direction (degrees) from the parent gear's centre; ignored for the root */
  dir?: number;
  accent?: boolean;
};

export type PlacedGear = {
  teeth: number;
  x: number;
  y: number;
  r: number;
  /** angle = phase + ratio * driverAngle */
  phase: number;
  ratio: number;
  accent: boolean;
};

/**
 * Lays out a chain of meshing gears. Each gear meshes with the previous one.
 * For gear B meshing with parent A at direction φ (A's tooth centred on the
 * contact line when A's angle is φ), B must present a gap there:
 *   b = φ + 180 − τb/2 − (Na/Nb)(a − φ)
 */
export function layoutTrain(specs: GearSpec[], mod: number): PlacedGear[] {
  const out: PlacedGear[] = [];
  specs.forEach((s, i) => {
    const r = pitchR(s.teeth, mod);
    if (i === 0) {
      out.push({ teeth: s.teeth, x: 0, y: 0, r, phase: 0, ratio: 1, accent: !!s.accent });
      return;
    }
    const p = out[i - 1];
    const phi = s.dir ?? 0;
    const rad = (phi * Math.PI) / 180;
    const dist = p.r + r;
    const tauB = 360 / s.teeth;
    const k = p.teeth / s.teeth;
    // b = phi + 180 - tauB/2 - k*(a - phi), with a = p.phase + p.ratio*D
    out.push({
      teeth: s.teeth,
      x: p.x + dist * Math.cos(rad),
      y: p.y + dist * Math.sin(rad),
      r,
      phase: phi + 180 - tauB / 2 - k * (p.phase - phi),
      ratio: -k * p.ratio,
      accent: !!s.accent,
    });
  });
  return out;
}
