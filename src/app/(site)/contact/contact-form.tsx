"use client";

import { useActionState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { sendMessage } from "@/app/actions/contact";
import type { FormState } from "@/app/actions/auth";
import { Field } from "@/components/ui/field";

const TOPICS = ["General", "Parts order", "Robot rental", "3D printing", "Custom project", "Lab setup", "Careers"];

export function ContactForm({ defaultTopic }: { defaultTopic?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(sendMessage, undefined);
  const fe = state?.fieldErrors ?? {};

  if (state?.ok) {
    return (
      <div className="py-10">
        <CheckCircle size={40} weight="fill" className="text-ok" />
        <p className="display mt-4 text-3xl">Thanks. It&apos;s with the team.</p>
        <p className="mt-2 text-fg-2">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2" noValidate>
      <Field label="Your name" name="name" error={fe.name}>
        <input id="name" name="name" autoComplete="name" className="input" aria-invalid={!!fe.name} />
      </Field>
      <Field label="Phone (optional)" name="phone" error={fe.phone}>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className="input" />
      </Field>
      <Field label="Email" name="email" error={fe.email} className="sm:col-span-2">
        <input id="email" name="email" type="email" autoComplete="email" className="input" aria-invalid={!!fe.email} />
      </Field>
      <Field label="What's it about?" name="topic" error={fe.topic} className="sm:col-span-2">
        <select id="topic" name="topic" defaultValue={TOPICS.includes(defaultTopic ?? "") ? defaultTopic : "General"} className="input">
          {TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Message" name="message" error={fe.message} className="sm:col-span-2">
        <textarea id="message" name="message" rows={6} className="input" aria-invalid={!!fe.message} />
      </Field>
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company_website">Leave this empty</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      {state?.error && <p className="text-sm text-bad sm:col-span-2">{state.error}</p>}
      <div className="sm:col-span-2">
        <button className="btn btn-primary" disabled={pending}>{pending ? "Sending" : "Send message"}</button>
      </div>
    </form>
  );
}
