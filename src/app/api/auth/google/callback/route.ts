import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createSession, findOrCreateGoogleUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-access";
import { googleProfileFromCode, GOOGLE_STATE_COOKIE } from "@/lib/google";

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
  } catch (e) {
    console.error("[google sign-in]", e instanceof Error ? e.message : e);
    return fail("failed");
  }

  // Find or create the account. Without a saved account, orders, bookings and
  // points can't be linked to them, so a database failure stops sign-in here.
  let userId: string;
  try {
    userId = (await findOrCreateGoogleUser(profile)).id;
  } catch (e) {
    console.error("[google sign-in] account", e instanceof Error ? e.message : e);
    return fail("failed");
  }
  // Google has verified this email, so orders, rentals and prints placed with it
  // while signed out are theirs: show them in the account. (Not done for
  // password sign-ups, whose emails aren't verified.)
  const email = profile.email.toLowerCase();
  await Promise.all([
    db.order.updateMany({ where: { userId: null, email }, data: { userId } }),
    db.rentalBooking.updateMany({ where: { userId: null, email }, data: { userId } }),
    db.printJob.updateMany({ where: { userId: null, email }, data: { userId } }),
  ]).catch((e) => console.error("[google sign-in] link orders", e instanceof Error ? e.message : e));

  try {
    await createSession(userId);
  } catch (e) {
    // almost always a missing or short AUTH_SECRET on the server
    console.error("[google sign-in] session", e instanceof Error ? e.message : e);
    return fail("setup");
  }

  const admin = await isAdminEmail(profile.email).catch(() => false);
  const dest = admin ? (saved.next.startsWith("/admin") ? saved.next : "/admin") : saved.next && !saved.next.startsWith("/admin") ? saved.next : "/";
  const res = NextResponse.redirect(new URL(dest, origin));
  res.cookies.delete(GOOGLE_STATE_COOKIE);
  return res;
}
