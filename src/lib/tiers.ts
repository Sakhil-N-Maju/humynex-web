// Reward tiers are based on lifetime points earned (never reduced by spending).
export const TIERS = [
  { name: "Spark", min: 0, perk: "Earn points on every order, rental and print." },
  { name: "Circuit", min: 1500, perk: "Early access to rental dates in peak season." },
  { name: "Core", min: 6000, perk: "Free priority shipping and a dedicated build advisor." },
] as const;

export function tierFor(lifetime: number) {
  let current: (typeof TIERS)[number] = TIERS[0];
  for (const t of TIERS) if (lifetime >= t.min) current = t;
  const idx = TIERS.findIndex((t) => t.name === current.name);
  const next = TIERS[idx + 1] ?? null;
  return { current, next, toNext: next ? next.min - lifetime : 0 };
}
