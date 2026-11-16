"use client";

import { useActionState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { sendMessage } from "@/app/actions/contact";
import type { FormState } from "@/app/actions/auth";

const SERVICES = [
  ["Parts order", "Parts and components"],
  ["Robot rental", "Robot rental for an event"],
  ["3D printing", "3D printing"],
  ["Custom project", "Custom robot or automation"],
  ["Lab setup", "Robotics lab setup"],
  ["General", "Something else"],
];

const field =
  "h-12 w-full rounded-[10px] border border-white/15 bg-white/[0.04] px-4 text-white placeholder:text-white/40 transition-colors hover:border-white/30 focus:border-[#1E90FF] focus:outline-none";

export function LeadForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(sendMessage, undefined);
  const fe = state?.fieldErrors ?? {};

  if (state?.ok) {
    return (
      <div className="flex min-h-[320px] flex-col justify-center" role="status">
        <CheckCircle size={40} weight="fill" className="text-white" />
        <p className="display mt-4 text-3xl text-white">Thanks. It&apos;s with the team.</p>
        <p className="mt-2 text-white/70">{state.message}</p>
      </div>
    );
  }

  const label = "mb-1.5 block text-sm font-medium text-white/80";
  const err = (k: string) => fe[k] && <p id={`${k}-err`} className="mt-1.5 text-sm text-[#ff8a8a]" role="alert">{fe[k]}</p>;

  return (
    <form action={action} className="relative grid gap-5 sm:grid-cols-2" noValidate>
      <div>
        <label htmlFor="lf-name" className={label}>Your name</label>
        <input id="lf-name" name="name" autoComplete="name" className={field} aria-invalid={!!fe.name} aria-describedby={fe.name ? "name-err" : undefined} />
        {err("name")}
      </div>
      <div>
        <label htmlFor="lf-company" className={label}>Company or college (optional)</label>
        <input id="lf-company" name="company" autoComplete="organization" className={field} />
      </div>
      <div>
        <label htmlFor="lf-email" className={label}>Work email</label>
        <input id="lf-email" name="email" type="email" autoComplete="email" className={field} aria-invalid={!!fe.email} aria-describedby={fe.email ? "email-err" : undefined} />
        {err("email")}
      </div>
      <div>
        <label htmlFor="lf-phone" className={label}>Phone (optional)</label>
        <input id="lf-phone" name="phone" type="tel" autoComplete="tel" className={field} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="lf-topic" className={label}>What do you need?</label>
        <select id="lf-topic" name="topic" defaultValue="Custom project" className={`${field} appearance-none`}>
          {SERVICES.map(([v, l]) => (
            <option key={v} value={v} className="bg-[#050816]">{l}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="lf-message" className={label}>Details</label>
        <textarea
          id="lf-message"
          name="message"
          rows={4}
          placeholder="Quantities, dates, venue or a link to your design. Whatever helps us quote."
          className={`${field} h-auto py-3 leading-relaxed`}
          aria-invalid={!!fe.message}
          aria-describedby={fe.message ? "message-err" : undefined}
        />
        {err("message")}
      </div>
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="lf-hp">Leave this empty</label>
        <input id="lf-hp" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button disabled={pending} className="inline-flex h-12 items-center rounded-full bg-[#1E90FF] px-7 font-semibold text-white hover:bg-[#1A7FE6] transition-transform active:scale-[0.98] disabled:opacity-60">
          {pending ? "Sending" : "Request a quote"}
        </button>
        <span className="text-sm text-white/55">We reply within one working day.</span>
      </div>
    </form>
  );
}
