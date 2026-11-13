"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Lock, Tag } from "@phosphor-icons/react";
import { useCart } from "@/components/cart/cart-store";
import { Plate } from "@/components/ui/plate";
import { Field } from "@/components/ui/field";
import { usePayment } from "@/components/pay/use-payment";
import { toast } from "@/components/ui/toaster";
import { createOrder, quoteCart, type Totals } from "@/app/actions/shop";
import { formatINR } from "@/lib/money";
import { useMounted } from "@/lib/use-client-state";

const omit = (o: Record<string, string>, k: string) => Object.fromEntries(Object.entries(o).filter(([key]) => key !== k));

const STATES = [
  "Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh", "Telangana", "Maharashtra", "Goa", "Gujarat", "Delhi", "Uttar Pradesh",
  "West Bengal", "Rajasthan", "Madhya Pradesh", "Punjab", "Haryana", "Odisha", "Bihar", "Assam", "Jharkhand", "Chhattisgarh",
  "Uttarakhand", "Himachal Pradesh", "Jammu and Kashmir", "Puducherry", "Chandigarh", "Other",
];

type U = { name: string; email: string; phone: string; points: number } | null;

export function CheckoutClient({ user }: { user: U }) {
  const lines = useCart((s) => s.lines);
  const mounted = useMounted();
  const [addr, setAddr] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", line1: "", line2: "", city: "", state: "Kerala", postal: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState("");
  const [usePoints, setUsePoints] = useState(false);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [pending, start] = useTransition();
  const [placing, setPlacing] = useState(false);
  const { pay, busy, dialog } = usePayment();

  const key = useMemo(() => JSON.stringify(lines.map((l) => [l.productId, l.qty])), [lines]);

  useEffect(() => {
    if (!mounted || lines.length === 0) return;
    start(async () => {
      const t = await quoteCart(lines.map((l) => ({ productId: l.productId, qty: l.qty })), coupon, usePoints);
      setTotals(t);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, coupon, usePoints, mounted]);

  if (!mounted) return <div className="mt-10 h-96 animate-pulse rounded-[4px] bg-ink-2" />;
  if (lines.length === 0) {
    return (
      <div className="py-20">
        <p className="display text-3xl">Your cart is empty.</p>
        <Link href="/shop" className="btn btn-primary mt-6">Browse parts</Link>
      </div>
    );
  }

  const set = (k: keyof typeof addr) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddr((a) => ({ ...a, [k]: e.target.value }));
    if (errors[k]) setErrors((e) => omit(e, k));
  };
  const input = (k: keyof typeof addr, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input id={k} name={k} value={addr[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `${k}-error` : undefined} className="input" {...props} />
  );

  const place = async () => {
    setPlacing(true);
    const res = await createOrder({ lines: lines.map((l) => ({ productId: l.productId, qty: l.qty })), address: addr, coupon, usePoints });
    if (!res.ok) {
      if (res.fieldErrors) {
        setErrors(res.fieldErrors);
        toast.bad("Check the highlighted fields.");
      } else toast.bad(res.error ?? "Couldn't place the order.");
      setPlacing(false);
      return;
    }
    setPlacing(false);
    await pay("ORDER", res.orderId);
  };

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
      <form
        className="space-y-10"
        onSubmit={(e) => {
          e.preventDefault();
          place();
        }}
        noValidate
      >
        {!user && (
          <div className="surface flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <span className="text-fg-2">Sign in to earn points on this order and pay with points you have.</span>
            <Link href="/login?next=/checkout" className="font-semibold text-volt-hi hover:underline">Sign in</Link>
          </div>
        )}
        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-5 text-lg font-semibold">Contact</legend>
          <Field label="Full name" name="name" error={errors.name} className="sm:col-span-2">{input("name", { autoComplete: "name" })}</Field>
          <Field label="Email" name="email" error={errors.email}>{input("email", { type: "email", autoComplete: "email" })}</Field>
          <Field label="Phone" name="phone" error={errors.phone}>{input("phone", { type: "tel", autoComplete: "tel", inputMode: "tel" })}</Field>
        </fieldset>
        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-5 text-lg font-semibold">Delivery address</legend>
          <Field label="Address" name="line1" error={errors.line1} className="sm:col-span-2">{input("line1", { autoComplete: "address-line1" })}</Field>
          <Field label="Apartment, landmark (optional)" name="line2" className="sm:col-span-2">{input("line2", { autoComplete: "address-line2" })}</Field>
          <Field label="City" name="city" error={errors.city}>{input("city", { autoComplete: "address-level2" })}</Field>
          <Field label="PIN code" name="postal" error={errors.postal}>{input("postal", { autoComplete: "postal-code", inputMode: "numeric", maxLength: 6 })}</Field>
          <Field label="State" name="state" error={errors.state}>
            <select id="state" name="state" value={addr.state} onChange={set("state")} className="input">
              {STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </fieldset>
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={placing || busy || !totals || totals.unavailable.length > 0}>
          <Lock size={16} /> {placing || busy ? "Opening payment" : `Pay ${totals ? formatINR(totals.total) : ""}`}
        </button>
        <p className="text-xs text-fg-3">Payments are processed by Razorpay: UPI, cards, net banking and wallets. We never see your card details.</p>
      </form>

      <aside className="h-fit space-y-6 lg:sticky lg:top-24">
        <div className="surface p-5">
          <h2 className="font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-4">
            {lines.map((l) => (
              <li key={l.productId} className="flex items-center gap-3">
                <Plate src={l.image} alt={l.name} kind={l.category} className="size-14 shrink-0" sizes="56px" chamfer={false} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{l.name}</p>
                  <p className="font-mono text-xs text-fg-3">{l.qty} x {formatINR(l.price)}</p>
                </div>
                <span className="font-mono text-sm">{formatINR(l.qty * l.price)}</span>
              </li>
            ))}
          </ul>

          <form
            className="mt-6 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setCoupon(couponInput.trim());
            }}
          >
            <label htmlFor="coupon" className="sr-only">Offer code</label>
            <div className="relative flex-1">
              <Tag size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-3" />
              <input id="coupon" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="Offer code" className="input h-10 pl-9 font-mono uppercase" />
            </div>
            <button className="btn btn-ghost btn-sm h-10">Apply</button>
          </form>
          {coupon && totals?.couponError && <p className="mt-2 text-sm text-bad">{totals.couponError}</p>}
          {coupon && totals?.couponTitle && <p className="mt-2 text-sm text-ok">{totals.couponTitle} applied.</p>}

          {user && totals && totals.maxPoints > 0 && (
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-[4px] border border-line-2 p-3 text-sm">
              <input type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} className="mt-0.5 size-4 accent-[#1e90ff]" />
              <span>
                Use <strong className="font-mono">{totals.maxPoints}</strong> points (₹{totals.maxPoints} off).{" "}
                <span className="text-fg-3">You have {user.points}.</span>
              </span>
            </label>
          )}

          <dl className={`mt-6 space-y-2 border-t border-line pt-4 text-sm transition-opacity ${pending ? "opacity-50" : ""}`}>
            <Row label="Subtotal" value={totals?.subtotal} />
            {!!totals?.discount && <Row label="Offer" value={-totals.discount} />}
            {!!totals?.pointsUsed && <Row label="Points" value={-totals.pointsUsed * 100} />}
            <Row label="Shipping" value={totals?.shipping} free />
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-mono font-semibold">{totals ? formatINR(totals.total) : "..."}</dd>
            </div>
          </dl>
          {totals && totals.unavailable.length > 0 && (
            <p className="mt-3 text-sm text-bad">{totals.unavailable.join(". ")}. Update your cart to continue.</p>
          )}
        </div>
      </aside>
      {dialog}
    </div>
  );
}

function Row({ label, value, free }: { label: string; value?: number; free?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-fg-2">{label}</dt>
      <dd className="font-mono">{value === undefined ? "..." : free && value === 0 ? "Free" : value < 0 ? `- ${formatINR(-value)}` : formatINR(value)}</dd>
    </div>
  );
}
