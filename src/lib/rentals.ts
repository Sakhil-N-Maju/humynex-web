import "server-only";
import { db } from "./db";

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Parse "YYYY-MM-DD" as a UTC midnight date. */
export function parseDay(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function dayString(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function daysInclusive(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
}

const HOLDING = ["PENDING_PAYMENT", "CONFIRMED", "ACTIVE"];
// Unpaid holds expire so abandoned checkouts don't block dates forever.
const HOLD_MINUTES = 30;

/** Units already committed on any day in [start, end]. Returns the peak. */
export async function unitsBooked(itemId: string, start: Date, end: Date, excludeId?: string) {
  const holdCutoff = new Date(Date.now() - HOLD_MINUTES * 60 * 1000);
  const overlapping = await db.rentalBooking.findMany({
    where: {
      itemId,
      id: excludeId ? { not: excludeId } : undefined,
      status: { in: HOLDING },
      startDate: { lte: end },
      endDate: { gte: start },
      OR: [{ status: { not: "PENDING_PAYMENT" } }, { createdAt: { gte: holdCutoff } }],
    },
    select: { startDate: true, endDate: true, quantity: true },
  });
  let peak = 0;
  for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS) {
    let used = 0;
    for (const b of overlapping) {
      if (b.startDate.getTime() <= t && b.endDate.getTime() >= t) used += b.quantity;
    }
    peak = Math.max(peak, used);
  }
  return peak;
}

/** Day strings in the next N days where the item is fully booked. */
export async function blockedDays(itemId: string, units: number, horizonDays = 120) {
  const start = parseDay(dayString(new Date()))!;
  const end = new Date(start.getTime() + horizonDays * DAY_MS);
  const holdCutoff = new Date(Date.now() - HOLD_MINUTES * 60 * 1000);
  const bookings = await db.rentalBooking.findMany({
    where: {
      itemId,
      status: { in: HOLDING },
      startDate: { lte: end },
      endDate: { gte: start },
      OR: [{ status: { not: "PENDING_PAYMENT" } }, { createdAt: { gte: holdCutoff } }],
    },
    select: { startDate: true, endDate: true, quantity: true },
  });
  const blocked: string[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS) {
    let used = 0;
    for (const b of bookings) {
      if (b.startDate.getTime() <= t && b.endDate.getTime() >= t) used += b.quantity;
    }
    if (used >= units) blocked.push(dayString(new Date(t)));
  }
  return blocked;
}
