"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CaretLeft, CaretRight, CheckCircle, PaperPlaneTilt } from "@phosphor-icons/react";
import clsx from "clsx";
import { quoteRental, sendRentalEnquiry, type RentalQuote } from "@/app/actions/rentals";
import { Field } from "@/components/ui/field";
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
  // fixed for the life of the widget; booking only looks 120 days ahead
  const [{ todayIso, maxIso }] = useState(() => ({ todayIso: iso(new Date()), maxIso: iso(new Date(Date.now() + 120 * DAY)) }));
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [quoteState, setQuote] = useState<RentalQuote | null>(null);
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", venue: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startT] = useTransition();
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  const crossesBooked = (a: string, b: string) => {
    for (let t = utc(a).getTime(); t <= utc(b).getTime(); t += DAY) {
      if (blockedSet.has(iso(new Date(t)))) return true;
    }
    return false;
  };
  /** Set a range after checking it; returns false (and says why) if it isn't bookable. */
  const setRange = (a: string, b: string | null) => {
    if (b && crossesBooked(a, b)) {
      toast.bad("That range crosses a booked day. Pick a shorter range.");
      return false;
    }
    setStart(a);
    setEnd(b);
    return true;
  };

  // Tap a start day, then an end day. After that, tapping later moves the
  // end, tapping earlier moves the start, and tapping the start day again
  // starts over, so a range can always be stretched to any length.
  const pick = (d: string) => {
    if (!start) return setRange(d, null);
    if (d === start) return setRange(d, end ? null : d);
    if (d < start) return setRange(d, end ?? start);
    setRange(start, d);
  };

  // typed dates from the From / To fields
  const typeFrom = (v: string) => {
    if (!v) {
      setStart(null);
      setEnd(null);
      return;
    }
    if (v < todayIso || blockedSet.has(v)) return toast.bad("That start date isn't available.");
    setRange(v, end && end >= v ? end : null);
  };
  const typeTo = (v: string) => {
    if (!v) return setEnd(null);
    if (!start) return toast.bad("Pick a start date first.");
    if (v < start) return toast.bad("The end date can't be before the start date.");
    setRange(start, v);
  };

  const rangeEnd = start ? (end ?? (item.minDays === 1 ? start : null)) : null;
  useEffect(() => {
    if (!start || !rangeEnd) return;
    startT(async () => setQuote(await quoteRental(item.id, start, rangeEnd, qty)));
  }, [start, rangeEnd, qty, item.id]);
  // a quote only counts while a complete range is selected
  const quote = start && rangeEnd ? quoteState : null;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((e) => Object.fromEntries(Object.entries(e).filter(([key]) => key !== k)));
  };

  const submit = async () => {
    if (!start) return toast.bad("Pick your dates first.");
    setSaving(true);
    const res = await sendRentalEnquiry({ itemId: item.id, start, end: end ?? start, quantity: qty, ...form });
    setSaving(false);
    if (!res.ok) {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      toast.bad(res.error ?? "Check the highlighted fields.");
      return;
    }
    setSent(true);
  };

  return (
    <div data-theme="dark" className="rounded-[28px] bg-[#050816] p-6 text-white md:p-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Book {item.name}</h2>
        <span className="font-mono text-sm text-fg-2">{formatINR(item.dailyRate)}/day</span>
      </div>

      <div className="mt-5">
        <Calendar blocked={blockedSet} start={start} end={end} onPick={pick} />
      </div>

      <p className="mt-3 text-xs text-fg-3">Tap a start date, then an end date. Tap again to stretch or shorten the range.</p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <label className="block rounded-[14px] border border-line-2 p-3 focus-within:border-[#67D4FF]">
          <span className="block text-xs text-fg-3">From</span>
          <input
            type="date"
            value={start ?? ""}
            min={todayIso}
            max={maxIso}
            onChange={(e) => typeFrom(e.target.value)}
            className="mt-1 w-full bg-transparent font-mono text-white [color-scheme:dark] focus:outline-none"
            aria-label="Start date"
          />
        </label>
        <label className="block rounded-[14px] border border-line-2 p-3 focus-within:border-[#67D4FF]">
          <span className="block text-xs text-fg-3">To</span>
          <input
            type="date"
            value={end ?? (start && item.minDays === 1 ? start : "")}
            min={start ?? todayIso}
            max={maxIso}
            onChange={(e) => typeTo(e.target.value)}
            className="mt-1 w-full bg-transparent font-mono text-white [color-scheme:dark] focus:outline-none"
            aria-label="End date"
          />
        </label>
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
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><span>Estimated total</span><span className="font-mono">{formatINR(quote.total)}</span></div>
            {quote.couponError && <p className="text-bad">{quote.couponError}</p>}
          </>
        )}
        {!quote && <p className="text-fg-3">{start && item.minDays > 1 ? `Pick an end date (minimum ${item.minDays} days).` : "Choose dates to see the price."}</p>}
      </div>

      {sent && (
        <div className="mt-6 rounded-[20px] border border-white/10 p-6" role="status">
          <CheckCircle size={36} weight="fill" className="text-[#1E90FF]" />
          <p className="display mt-4 text-2xl">Enquiry sent.</p>
          <p className="mt-2 text-sm text-fg-2">Thanks{form.name ? `, ${form.name.split(" ")[0]}` : ""}. We&apos;ll call you within one working day to confirm your dates and plan the event.</p>
        </div>
      )}

      {quote?.ok && !sent && (
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
          <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1E90FF] font-semibold text-[#050816] transition-colors hover:bg-[#67D4FF] disabled:opacity-45" disabled={saving || pending}>
            <PaperPlaneTilt size={16} weight="bold" /> {saving ? "Sending" : "Send enquiry"}
          </button>
          <p className="text-xs text-fg-3">No payment now. We&apos;ll call within one working day to confirm availability, timings and the final price.</p>
        </form>
      )}
    </div>
  );
}
