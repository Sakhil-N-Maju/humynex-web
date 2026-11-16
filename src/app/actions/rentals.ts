"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { evaluateCoupon } from "@/lib/coupons";
import { daysInclusive, parseDay, unitsBooked, dayString } from "@/lib/rentals";
import { refNumber } from "@/lib/ids";

export type RentalQuote =
  | { ok: true; days: number; rent: number; deposit: number; discount: number; total: number; available: number; couponTitle?: string; couponError?: string }
  | { ok: false; error: string };

async function quote(itemId: string, start: string, end: string, qty: number, coupon?: string): Promise<RentalQuote & { item?: Awaited<ReturnType<typeof db.rentalItem.findUnique>> }> {
  const item = await db.rentalItem.findUnique({ where: { id: itemId } });
  if (!item || !item.active) return { ok: false, error: "This item isn't available for rent right now." };
  const s = parseDay(start);
  const e = parseDay(end);
  if (!s || !e) return { ok: false, error: "Pick your start and end dates." };
  const today = parseDay(dayString(new Date()))!;
  if (s < today) return { ok: false, error: "The start date is in the past." };
  if (e < s) return { ok: false, error: "The end date is before the start date." };
  const days = daysInclusive(s, e);
  if (days < item.minDays) return { ok: false, error: `Minimum rental is ${item.minDays} days.` };
  if (days > 30) return { ok: false, error: "For rentals longer than 30 days, contact us for a monthly rate." };
  const used = await unitsBooked(item.id, s, e);
  const available = Math.max(0, item.units - used);
  if (qty > available) {
    return { ok: false, error: available === 0 ? "Fully booked on some of those dates. Try other dates." : `Only ${available} available for those dates.` };
  }
  const rent = item.dailyRate * days * qty;
  const deposit = item.deposit * qty;
  let discount = 0;
  let couponTitle: string | undefined;
  let couponError: string | undefined;
  if (coupon?.trim()) {
    const user = await getUser();
    const res = await evaluateCoupon(coupon, "RENTAL", rent, !!user);
    if (res.ok) {
      discount = res.discount;
      couponTitle = res.title;
    } else couponError = res.error;
  }
  return { ok: true, days, rent, deposit, discount, total: rent - discount + deposit, available, couponTitle, couponError, item };
}

export async function quoteRental(itemId: string, start: string, end: string, qty: number, coupon?: string): Promise<RentalQuote> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { item, ...rest } = await quote(itemId, start, end, Math.max(1, Math.floor(qty)), coupon);
  return rest as RentalQuote;
}

const bookingSchema = z.object({
  itemId: z.string().min(1),
  start: z.string(),
  end: z.string(),
  quantity: z.number().int().min(1).max(10),
  name: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,15}$/, "Enter a valid phone number."),
  venue: z.string().trim().min(4, "Tell us where the event is."),
  notes: z.string().trim().max(1000).optional(),
  coupon: z.string().trim().optional(),
});

export async function createBooking(
  input: z.input<typeof bookingSchema>,
): Promise<{ ok: true; bookingId: string } | { ok: false; error?: string; fieldErrors?: Record<string, string> }> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  }
  const d = parsed.data;
  const q = await quote(d.itemId, d.start, d.end, d.quantity, d.coupon);
  if (!q.ok) return { ok: false, error: q.error };
  if (d.coupon && q.couponError) return { ok: false, error: q.couponError };
  const user = await getUser();
  const booking = await db.rentalBooking.create({
    data: {
      number: refNumber("RNT"),
      userId: user?.id ?? null,
      itemId: d.itemId,
      startDate: parseDay(d.start)!,
      endDate: parseDay(d.end)!,
      days: q.days,
      quantity: d.quantity,
      name: d.name,
      email: d.email,
      phone: d.phone,
      venue: d.venue,
      notes: d.notes || null,
      rentTotal: q.rent,
      deposit: q.deposit,
      discount: q.discount,
      couponCode: q.discount > 0 ? d.coupon!.toUpperCase() : null,
      total: q.total,
      status: "PENDING_PAYMENT",
    },
  });
  return { ok: true, bookingId: booking.id };
}

/**
 * A rental enquiry: checks the dates are free, then files it under Rental
 * bookings as an ENQUIRY. The team reviews it, calls the customer, and approves
 * it; the customer then pays from their account.
 */
export async function sendRentalEnquiry(
  input: z.input<typeof bookingSchema>,
): Promise<{ ok: true; number: string; signedIn: boolean } | { ok: false; error?: string; fieldErrors?: Record<string, string> }> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  }
  const d = parsed.data;
  const q = await quote(d.itemId, d.start, d.end, d.quantity);
  if (!q.ok) return { ok: false, error: q.error };
  const user = await getUser();

  try {
    const b = await db.rentalBooking.create({
      data: {
        number: refNumber("RNT"),
        userId: user?.id ?? null,
        itemId: d.itemId,
        startDate: parseDay(d.start)!,
        endDate: parseDay(d.end)!,
        days: q.days,
        quantity: d.quantity,
        name: d.name,
        email: d.email,
        phone: d.phone,
        venue: d.venue,
        notes: d.notes || null,
        rentTotal: q.rent,
        deposit: q.deposit,
        discount: 0,
        total: q.rent + q.deposit,
        status: "ENQUIRY",
      },
    });
    return { ok: true, number: b.number, signedIn: !!user };
  } catch (e) {
    console.error("[rental enquiry]", e instanceof Error ? e.message : e);
    return { ok: false, error: "Couldn't send right now. Please call or email us instead." };
  }
}
