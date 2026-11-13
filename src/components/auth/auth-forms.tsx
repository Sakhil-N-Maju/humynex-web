"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type FormState } from "@/app/actions/auth";
import { Field } from "@/components/ui/field";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, undefined);
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <Field label="Email" name="email">
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </Field>
      <Field label="Password" name="password">
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </Field>
      {state?.error && <p className="text-sm text-bad" role="alert">{state.error}</p>}
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Signing in" : "Sign in"}</button>
      <p className="text-sm text-fg-2">
        New to Humynex?{" "}
        <Link href={`/signup${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-volt-hi hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm({ next, bonus }: { next: string; bonus: number }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signup, undefined);
  const fe = state?.fieldErrors ?? {};
  const aria = (k: string) => ({ "aria-invalid": !!fe[k], "aria-describedby": fe[k] ? `${k}-error` : undefined });
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <Field label="Full name" name="name" error={fe.name}>
        <input id="name" name="name" autoComplete="name" className="input" {...aria("name")} />
      </Field>
      <Field label="Email" name="email" error={fe.email}>
        <input id="email" name="email" type="email" autoComplete="email" className="input" {...aria("email")} />
      </Field>
      <Field label="Phone (optional)" name="phone" error={fe.phone} hint="For delivery and rental coordination.">
        <input id="phone" name="phone" type="tel" autoComplete="tel" className="input" {...aria("phone")} />
      </Field>
      <Field label="Password" name="password" error={fe.password} hint="At least 8 characters.">
        <input id="password" name="password" type="password" autoComplete="new-password" className="input" {...aria("password")} />
      </Field>
      {state?.error && <p className="text-sm text-bad" role="alert">{state.error}</p>}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Creating account" : `Create account and get ${bonus} points`}
      </button>
      <p className="text-sm text-fg-2">
        Already have an account?{" "}
        <Link href={`/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-volt-hi hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
