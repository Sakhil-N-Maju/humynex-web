"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CaretLeft, CaretRight, Lock } from "@phosphor-icons/react";
import clsx from "clsx";
import { quoteRental, createBooking, type RentalQuote } from "@/app/actions/rentals";
import { Field } from "@/components/ui/field";
import { usePayment } from "@/components/pay/use-payment";
import { toast } from "@/components/ui/toaster";
import { formatINR } from "@/lib/money";

type Item = { id: string; name: string; dailyRate: number; deposit: number; minDays: number; units: number };
type U = { name: string; email: string; phone: string } | null;

const DAY = 86400000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const utc = (s: string) => new Date(`${s}T00:00:00Z`);
const WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function Calendar({
  blocked,
  start,
  end,
  onPick,
}: {
  blocked: Set<string>;
  start: string | null;
  end: string | null;
  onPick: (d: string) => void;
}) {
  const today = iso(new Date());
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1));
  });
  const [hover, setHover] = useState<string | null>(null);
  const days = useMemo(() => {
    const first = month;
    const offset = (first.getUTCDay() + 6) % 7; // Monday first
    const count = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => iso(new Date(first.getTime() + i * DAY)))];
  }, [month]);
  const minMonth = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
  const maxMonth = new Date(minMonth.getTime() + 120 * DAY);
  const rangeEnd = end ?? (start && hover && hover > start ? hover : null);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="grid size-8 place-items-center rounded-[4px] hover:bg-ink-3 disabled:opacity-25"
          disabled={month <= minMonth}
          onClick={() => setMonth(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() - 1, 1)))}
          aria-label="Previous month"
        >
          <CaretLeft size={16} />
        </button>
        <span className="text-sm font-semibold" aria-live="polite">
          {month.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" })}
        </span>
        <button
          type="button"
          className="grid size-8 place-items-center rounded-[4px] hover:bg-ink-3 disabled:opacity-25"
          disabled={month >= maxMonth}
          onClick={() => setMonth(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1)))}
          aria-label="Next month"
        >
          <CaretRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center" role="grid" onMouseLeave={() => setHover(null)}>
        {WEEK.map((w) => (
          <span key={w} className="py-1 text-xs text-fg-3">{w}</span>
        ))}
        {days.map((d, i) => {
          if (!d) return <span key={`x${i}`} />;
          const past = d < today;
          const isBlocked = blocked.has(d);
          const disabled = past || isBlocked;
          const isStart = d === start;
          const isEnd = d === rangeEnd;
          const inRange = start && rangeEnd && d > start && d < rangeEnd;
          return (
            <button
              key={d}
              type="button"
              disabled={disabled}
              onClick={() => onPick(d)}
              onMouseEnter={() => setHover(d)}
              aria-pressed={isStart || isEnd}
              aria-label={`${utc(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", timeZone: "UTC" })}${isBlocked ? ", fully booked" : ""}`}
              className={clsx(
                "relative h-9 rounded-[4px] font-mono text-sm transition-colors",
                disabled && "cursor-not-allowed text-fg-3/50",
                isBlocked && !past && "line-through decoration-bad/70",
                !disabled && !isStart && !isEnd && !inRange && "hover:bg-ink-4",
                inRange && "bg-volt/15 text-fg",
                (isStart || isEnd) && "bg-volt font-semibold text-ink",
              )}
            >
              {Number(d.slice(8))}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-fg-3">Struck-through dates are fully booked.</p>
    </div>
  );
}

export function BookingWidget({ item, blocked, user }: { item: Item; blocked: string[]; user: U }) {
  const blockedSet = useMemo(() => new Set(blocked), [blocked]);
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [quoteState, setQuote] = useState<RentalQuote | null>(null);
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", venue: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startT] = useTransition();
  const [saving, setSaving] = useState(false);
  const { pay, busy, dialog } = usePayment();

  const pick = (d: string) => {
    if (!start || end || d < start) {
      setStart(d);
      setEnd(null);
      return;
    }
    // a range can't cross a fully-booked day
    for (let t = utc(start).getTime(); t <= utc(d).getTime(); t += DAY) {
      if (blockedSet.has(iso(new Date(t)))) {
        toast.bad("That range crosses a booked day. Pick a shorter range.");
        return;
      }
    }
    setEnd(d);
  };

  const rangeEnd = start ? (end ?? (item.minDays === 1 ? start : null)) : null;
  useEffect(() => {
    if (!start || !rangeEnd) return;
    startT(async () => setQuote(await quoteRental(item.id, start, rangeEnd, qty, appliedCoupon)));
  }, [start, rangeEnd, qty, appliedCoupon, item.id]);
  // a quote only counts while a complete range is selected
  const quote = start && rangeEnd ? quoteState : null;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((e) => Object.fromEntries(Object.entries(e).filter(([key]) => key !== k)));
  };

  const submit = async () => {
    if (!start) return toast.bad("Pick your dates first.");
    setSaving(true);
    const res = await createBooking({ itemId: item.id, start, end: end ?? start, quantity: qty, ...form, coupon: appliedCoupon || undefined });
    setSaving(false);
    if (!res.ok) {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      toast.bad(res.error ?? "Check the highlighted fields.");
      return;
    }
    await pay("RENTAL", res.bookingId);
  };

  const fmt = (s: string) => utc(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <div data-theme="dark" className="rounded-[28px] bg-[#050816] p-6 text-white md:p-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Book {item.name}</h2>
        <span className="font-mono text-sm text-fg-2">{formatINR(item.dailyRate)}/day</span>
      </div>

      <div className="mt-5">
        <Calendar blocked={blockedSet} start={start} end={end} onPick={pick} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-[4px] border border-line-2 p-3">
          <span className="block text-xs text-fg-3">From</span>
          <span className="font-mono">{start ? fmt(start) : "Pick a date"}</span>
        </div>
        <div className="rounded-[4px] border border-line-2 p-3">
          <span className="block text-xs text-fg-3">To</span>
          <span className="font-mono">{end ? fmt(end) : start && item.minDays === 1 ? fmt(start) : "Pick a date"}</span>
        </div>
      </div>

      {item.units > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <label htmlFor="qty" className="text-fg-2">Units</label>
          <select id="qty" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="input h-9 w-24">
            {Array.from({ length: item.units }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
      )}

      <div className={clsx("mt-5 space-y-2 border-t border-line pt-4 text-sm transition-opacity", pending && "opacity-50")} aria-live="polite">
        {quote && !quote.ok && <p className="text-bad">{quote.error}</p>}
        {quote?.ok && (
          <>
            <div className="flex justify-between"><span className="text-fg-2">{formatINR(item.dailyRate)} x {quote.days} day{quote.days > 1 ? "s" : ""}{qty > 1 ? ` x ${qty}` : ""}</span><span className="font-mono">{formatINR(quote.rent)}</span></div>
            {quote.discount > 0 && <div className="flex justify-between text-ok"><span>{quote.couponTitle}</span><span className="font-mono">- {formatINR(quote.discount)}</span></div>}
            <div className="flex justify-between"><span className="text-fg-2">Refundable deposit</span><span className="font-mono">{formatINR(quote.deposit)}</span></div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><span>Pay now</span><span className="font-mono">{formatINR(quote.total)}</span></div>
            {quote.couponError && <p className="text-bad">{quote.couponError}</p>}
          </>
        )}
        {!quote && <p className="text-fg-3">{start && item.minDays > 1 ? `Pick an end date (minimum ${item.minDays} days).` : "Choose dates to see the price."}</p>}
      </div>

      {quote?.ok && (
        <form
          className="mt-6 space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" name="name" error={errors.name}><input id="name" value={form.name} onChange={set("name")} className="input" autoComplete="name" aria-invalid={!!errors.name} /></Field>
            <Field label="Phone" name="phone" error={errors.phone}><input id="phone" value={form.phone} onChange={set("phone")} className="input" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} /></Field>
          </div>
          <Field label="Email" name="email" error={errors.email}><input id="email" value={form.email} onChange={set("email")} className="input" type="email" autoComplete="email" aria-invalid={!!errors.email} /></Field>
          <Field label="Event venue and city" name="venue" error={errors.venue}><input id="venue" value={form.venue} onChange={set("venue")} className="input" aria-invalid={!!errors.venue} /></Field>
          <Field label="Anything we should know? (optional)" name="notes"><textarea id="notes" rows={3} value={form.notes} onChange={set("notes")} className="input" /></Field>
          <div className="flex gap-2">
            <label htmlFor="rcoupon" className="sr-only">Offer code</label>
            <input id="rcoupon" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Offer code" className="input h-10 font-mono uppercase" />
            <button type="button" className="h-11 shrink-0 rounded-full border border-white/25 px-4 text-sm font-medium transition-colors hover:border-white" onClick={() => setAppliedCoupon(coupon.trim())}>Apply</button>
          </div>
          <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1E90FF] font-semibold text-[#050816] transition-colors hover:bg-[#67D4FF] disabled:opacity-45" disabled={saving || busy || pending}>
            <Lock size={16} /> {saving || busy ? "Opening payment" : `Book and pay ${formatINR(quote.total)}`}
          </button>
          <p className="text-xs text-fg-3">The deposit is refunded within 3 working days after the robot is returned in good condition.</p>
        </form>
      )}
      {dialog}
    </div>
  );
}
