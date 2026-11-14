"use client";

import { useActionState } from "react";
import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react";
import { sendMessage } from "@/app/actions/contact";
import type { FormState } from "@/app/actions/auth";

const TOPICS = ["General", "Parts order", "Robot rental", "3D printing", "Custom project", "Lab setup", "Careers"];

const label = "block text-[0.95rem] font-medium text-[#050816]";
const line =
  "mt-3 block w-full border-0 border-b border-[#050816]/15 bg-transparent px-0 pb-4 text-lg text-[#050816] placeholder:text-[#050816]/35 transition-colors focus:border-[#1E90FF] focus:outline-none focus:ring-0 aria-[invalid=true]:border-[#c2410c]";

function Err({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-[#c2410c]">
      {msg}
    </p>
  );
}

/** Name, email, message on hairlines, like a letter. Topic rides along from the link that brought you here. */
export function ContactForm({ defaultTopic }: { defaultTopic?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(sendMessage, undefined);
  const fe = state?.fieldErrors ?? {};
  const topic = TOPICS.includes(defaultTopic ?? "") ? defaultTopic : "General";

  if (state?.ok) {
    return (
      <div className="py-10" role="status">
        <CheckCircle size={44} weight="fill" className="text-[#1E90FF]" />
        <p className="display mt-5 text-4xl">Thanks. It&apos;s with the team.</p>
        <p className="mt-3 text-lg text-[#050816]/60">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-10">
      <input type="hidden" name="topic" value={topic} />
      <div>
        <label htmlFor="name" className={label}>Name</label>
        <input id="name" name="name" autoComplete="name" placeholder="Your name" className={line} aria-invalid={!!fe.name} aria-describedby={fe.name ? "name-error" : undefined} />
        <Err id="name" msg={fe.name} />
      </div>
      <div>
        <label htmlFor="email" className={label}>Email</label>
        <input id="email" name="email" type="email" autoComplete="email" placeholder="Your email" className={line} aria-invalid={!!fe.email} aria-describedby={fe.email ? "email-error" : undefined} />
        <Err id="email" msg={fe.email} />
      </div>
      <div>
        <label htmlFor="message" className={label}>Message</label>
        <textarea id="message" name="message" rows={3} placeholder="Your message" className={`${line} resize-none`} aria-invalid={!!fe.message} aria-describedby={fe.message ? "message-error" : undefined} />
        <Err id="message" msg={fe.message} />
      </div>
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company_website">Leave this empty</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      {state?.error && <p className="text-sm text-[#c2410c]" role="alert">{state.error}</p>}
      <button
        disabled={pending}
        className="group inline-flex h-12 items-center gap-2 rounded-full border border-[#050816]/25 px-7 text-[0.95rem] font-medium text-[#050816] transition-colors hover:border-[#050816] hover:bg-[#050816] hover:text-white disabled:opacity-50"
      >
        {pending ? "Sending" : "Send a message"}
        <ArrowUpRight size={16} weight="bold" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}
