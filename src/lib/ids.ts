import { randomBytes } from "node:crypto";

// Human-friendly reference numbers: HMX-7K2QF, RNT-..., PRT-...
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function refNumber(prefix: "HMX" | "RNT" | "PRT") {
  const bytes = randomBytes(5);
  let s = "";
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return `${prefix}-${s}`;
}
