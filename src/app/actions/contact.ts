"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import type { FormState } from "./auth";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  company: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(20).optional(),
  topic: z.enum(["General", "Parts order", "Robot rental", "3D printing", "Custom project", "Lab setup", "Careers"]),
  message: z.string().trim().min(10, "Tell us a little more (10 characters or more).").max(4000),
  // honeypot: real people never fill this in
  company_website: z.string().max(0).optional(),
});

export async function sendMessage(_: FormState, form: FormData): Promise<FormState> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const bot = parsed.error.issues.some((i) => i.path[0] === "company_website");
    if (bot) return { ok: true, message: "Thanks, we'll be in touch." };
    return { fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { company_website, ...data } = parsed.data;
  await db.contactMessage.create({ data: { ...data, phone: data.phone || null, company: data.company || null } });
  return { ok: true, message: "Message received. The team usually replies within one working day." };
}
