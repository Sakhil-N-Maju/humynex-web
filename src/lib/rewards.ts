import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { getSetting } from "./settings";

type Tx = Prisma.TransactionClient;

export async function grantSignupBonus(userId: string, tx: Tx = db) {
  const { signupBonus } = await getSetting("rewards");
  if (signupBonus <= 0) return 0;
  await tx.pointsEntry.create({
    data: { userId, delta: signupBonus, reason: "SIGNUP_BONUS", note: "Welcome to Humynex" },
  });
  await tx.user.update({
    where: { id: userId },
    data: { points: { increment: signupBonus }, lifetimePts: { increment: signupBonus } },
  });
  return signupBonus;
}

export async function pointsForAmount(paidPaise: number) {
  const { pointsPer100 } = await getSetting("rewards");
  return Math.floor(paidPaise / 100 / 100) * pointsPer100;
}

export async function awardPurchase(
  tx: Tx,
  userId: string | null,
  paidPaise: number,
  refType: "ORDER" | "RENTAL" | "PRINT",
  refId: string,
  label: string,
) {
  if (!userId) return 0;
  const pts = await pointsForAmount(paidPaise);
  if (pts <= 0) return 0;
  await tx.pointsEntry.create({
    data: { userId, delta: pts, reason: "PURCHASE", refType, refId, note: label },
  });
  await tx.user.update({
    where: { id: userId },
    data: { points: { increment: pts }, lifetimePts: { increment: pts } },
  });
  return pts;
}

/** Maximum points a user may apply to an amount (points are worth ₹1 each). */
export async function maxRedeemable(userPoints: number, amountPaise: number) {
  const { maxRedeemPct } = await getSetting("rewards");
  const capRupees = Math.floor((amountPaise / 100) * (maxRedeemPct / 100));
  return Math.max(0, Math.min(userPoints, capRupees));
}
