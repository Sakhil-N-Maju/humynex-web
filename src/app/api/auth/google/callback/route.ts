import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-access";
import { googleProfileFromCode, GOOGLE_STATE_COOKIE } from "@/lib/google";
import { grantSignupBonus } from "@/lib/rewards";

export const dynamic = "force-dynamic";

/**
 * Step 2: Google sends the visitor back here. Verify, find or create their
 * account, start a session, then route them: admins to the admin panel,
 * everyone else back to the website.
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const fail = (why: string) => {
    const res = NextResponse.redirect(new URL(`/login?google=${why}`, origin));
    res.cookies.delete(GOOGLE_STATE_COOKIE);
    return res;
  };

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (req.nextUrl.searchParams.get("error")) return fail("cancelled");

  let saved: { state: string; nonce: string; next: string };
  try {
    saved = JSON.parse(req.cookies.get(GOOGLE_STATE_COOKIE)?.value ?? "");
  } catch {
    return fail("expired");
  }
  if (!code || !state || state !== saved.state) return fail("expired");

  let profile: { email: string; name: string };
  try {
    profile = await googleProfileFromCode({ code, redirectUri: `${origin}/api/auth/google/callback`, nonce: saved.nonce });
  } catch {
    return fail("failed");
  }

  // Find or create the account. On the read-only demo the database can't be
  // written, so the session carries the profile itself instead.
  let userId: string | null = null;
  try {
    const existing = await db.user.findUnique({ where: { email: profile.email } });
    if (existing) userId = existing.id;
    else {
      const created = await db.$transaction(async (tx) => {
        const u = await tx.user.create({
          // Google accounts never use a password; store an unguessable one
          data: { email: profile.email, name: profile.name, passwordHash: await hashPassword(randomBytes(32).toString("hex")) },
        });
        await grantSignupBonus(u.id, tx);
        return u;
      });
      userId = created.id;
    }
  } catch {
    userId = null;
  }
  await createSession(userId ?? "", userId ? undefined : profile);

  const admin = await isAdminEmail(profile.email);
  const dest = admin ? (saved.next.startsWith("/admin") ? saved.next : "/admin") : saved.next && !saved.next.startsWith("/admin") ? saved.next : "/";
  const res = NextResponse.redirect(new URL(dest, origin));
  res.cookies.delete(GOOGLE_STATE_COOKIE);
  return res;
}
