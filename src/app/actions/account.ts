"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { STATES } from "@/lib/india";
import { publicMessage } from "@/lib/errors";

export type ProfileState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> } | undefined;

const opt = z.string().trim().max(200).optional().transform((v) => v || null);

const profileSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name.").max(80),
    phone: z
      .string()
      .trim()
      .regex(/^[+\d][\d\s-]{7,15}$/, "Enter a valid phone number.")
      .optional()
      .or(z.literal(""))
      .transform((v) => v || null),
    line1: opt,
    line2: opt,
    city: opt,
    state: z.string().trim().optional().transform((v) => v || null),
    postal: opt,
  })
  .superRefine((d, ctx) => {
    // address is all-or-nothing: once any part is filled, the rest is needed
    const started = d.line1 || d.line2 || d.city || d.postal;
    if (!started) return;
    if (!d.line1 || d.line1.length < 4) ctx.addIssue({ code: "custom", path: ["line1"], message: "Enter the street address." });
    if (!d.city || d.city.length < 2) ctx.addIssue({ code: "custom", path: ["city"], message: "Enter the city." });
    if (!d.postal || !/^\d{6}$/.test(d.postal)) ctx.addIssue({ code: "custom", path: ["postal"], message: "Enter a 6-digit PIN code." });
    if (!d.state || !STATES.includes(d.state)) ctx.addIssue({ code: "custom", path: ["state"], message: "Pick a state." });
  });

export async function updateProfile(_: ProfileState, form: FormData): Promise<ProfileState> {
  const user = await getUser();
  if (!user) return { error: "Your session ended. Sign in again." };
  const parsed = profileSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return { fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  }
  const d = parsed.data;
  const hasAddress = !!d.line1;
  try {
    await db.user.update({
      where: { id: user.id },
      data: {
        name: d.name,
        phone: d.phone,
        addrLine1: hasAddress ? d.line1 : null,
        addrLine2: hasAddress ? d.line2 : null,
        addrCity: hasAddress ? d.city : null,
        addrState: hasAddress ? d.state : null,
        addrPostal: hasAddress ? d.postal : null,
      },
    });
  } catch (e) {
    return { error: publicMessage(e, "Couldn't save right now. Please try again.", "profile") };
  }
  revalidatePath("/account");
  return { ok: true };
}
