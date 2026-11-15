"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession, hashPassword, verifyPassword, isAdmin } from "@/lib/auth";
import { grantSignupBonus } from "@/lib/rewards";

export type FormState = { error?: string; fieldErrors?: Record<string, string>; ok?: boolean; message?: string } | undefined;

function safeNext(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/account";
}

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{7,15}$/, "Enter a valid phone number.")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Use at least 8 characters."),
});

export async function signup(_: FormState, form: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return { fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  }
  const { name, email, phone, password } = parsed.data;
  const exists = await db.user.findUnique({ where: { email } });
  if (exists) return { fieldErrors: { email: "An account with this email already exists. Sign in instead." } };

  const user = await db.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: { name, email, phone: phone || null, passwordHash: await hashPassword(password) },
    });
    await grantSignupBonus(u.id, tx);
    return u;
  });
  await createSession(user.id);
  redirect(`${safeNext(form.get("next"))}${safeNext(form.get("next")).includes("?") ? "&" : "?"}welcome=1`);
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const user = await db.user.findUnique({ where: { email } });
  // same message for both cases so emails can't be enumerated
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "That email and password don't match." };
  }
  await createSession(user.id);
  const next = safeNext(form.get("next"));
  redirect((await isAdmin(user)) && next === "/account" ? "/admin" : next);
}

export async function logout() {
  await destroySession();
  redirect("/");
}
