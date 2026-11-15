"use client";

import Link from "next/link";
import { useActionState } from "react";
import { EnvelopeSimple, LockSimple, User, Phone } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { login, signup, type FormState } from "@/app/actions/auth";

/** Outlined field with its label sitting on the border and an icon inside. */
function AuthInput({
  id,
  label,
  icon: Glyph,
  error,
  hint,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; icon: Icon; error?: string; hint?: string }) {
  return (
    <div>
      <div className="group relative">
        <label
          htmlFor={id}
          className="absolute -top-2 left-4 z-10 bg-white px-1.5 text-[0.72rem] font-semibold text-[#1E90FF] group-focus-within:text-[#0b6fd6]"
        >
          {label}
        </label>
        <Glyph size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#050816]/55" aria-hidden="true" />
        <input
          id={id}
          name={id}
          {...input}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-[3.25rem] w-full rounded-[14px] border border-[#1E90FF]/45 bg-white pl-11 pr-4 text-[#050816] outline-none transition-[border-color,box-shadow] placeholder:text-[#050816]/30 focus:border-[#1E90FF] focus:shadow-[0_0_0_4px_rgb(30_144_255/0.14)] aria-[invalid=true]:border-[#dc2626]"
        />
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 pl-1 text-sm text-[#dc2626]">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 pl-1 text-xs text-[#050816]/45">{hint}</p>
      ) : null}
    </div>
  );
}

const submit =
  "mx-auto flex h-12 min-w-[180px] items-center justify-center rounded-full bg-[#1E90FF] px-8 font-semibold uppercase tracking-[0.06em] text-white shadow-[0_12px_28px_-10px_rgba(30,144,255,0.8)] transition-[background-color,transform] hover:bg-[#0b7fe8] active:scale-[0.98] disabled:opacity-50";

export function LoginForm({ next, children }: { next: string; children?: React.ReactNode }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, undefined);
  return (
    <form action={action} className="space-y-6" noValidate>
      <input type="hidden" name="next" value={next} />
      <AuthInput id="email" label="Email" icon={EnvelopeSimple} type="email" autoComplete="email" required placeholder="you@example.com" />
      <AuthInput id="password" label="Password" icon={LockSimple} type="password" autoComplete="current-password" required placeholder="Your password" />
      <p className="-mt-2 text-right text-xs text-[#050816]/50">
        Forgot your password?{" "}
        <Link href="/contact" className="font-medium text-[#050816] hover:text-[#1E90FF]">Ask us to reset it</Link>
      </p>
      {state?.error && <p className="text-center text-sm text-[#dc2626]" role="alert">{state.error}</p>}
      <button className={submit} disabled={pending}>{pending ? "Signing in" : "Sign in"}</button>
      {children}
      <p className="text-center text-sm text-[#050816]/60">
        New to Humynex?{" "}
        <Link href={`/signup${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-[#050816] hover:text-[#1E90FF]">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm({ next, bonus, children }: { next: string; bonus: number; children?: React.ReactNode }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signup, undefined);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-6" noValidate>
      <input type="hidden" name="next" value={next} />
      <AuthInput id="name" label="Full name" icon={User} autoComplete="name" placeholder="Your name" error={fe.name} />
      <AuthInput id="email" label="Email" icon={EnvelopeSimple} type="email" autoComplete="email" placeholder="you@example.com" error={fe.email} />
      <AuthInput id="phone" label="Phone (optional)" icon={Phone} type="tel" autoComplete="tel" placeholder="+91" error={fe.phone} hint="For delivery and rental coordination." />
      <AuthInput id="password" label="Password" icon={LockSimple} type="password" autoComplete="new-password" placeholder="At least 8 characters" error={fe.password} />
      {state?.error && <p className="text-center text-sm text-[#dc2626]" role="alert">{state.error}</p>}
      <button className={submit} disabled={pending}>{pending ? "Creating account" : "Create account"}</button>
      <p className="-mt-2 text-center text-xs text-[#050816]/50">New accounts start with {bonus} reward points (₹{bonus}).</p>
      {children}
      <p className="text-center text-sm text-[#050816]/60">
        Already have an account?{" "}
        <Link href={`/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-[#050816] hover:text-[#1E90FF]">
          Sign in
        </Link>
      </p>
    </form>
  );
}
