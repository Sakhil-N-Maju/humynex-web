import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { db } from "./db";

const COOKIE = "hmx_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET is missing or shorter than 32 characters. Set it in .env.");
  }
  return new TextEncoder().encode(s);
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 11);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

/**
 * Starts a session. Pass a profile for a Google sign-in that couldn't be saved
 * to the database (the read-only demo): the session then carries the email and
 * name itself instead of pointing at a user row.
 */
export async function createSession(userId: string, profile?: { email: string; name: string }) {
  const claims = profile ? { sub: `g:${profile.email}`, email: profile.email, name: profile.name } : { sub: userId };
  const token = await new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  points: number;
  lifetimePts: number;
};

// Cached per request so layouts and pages share one lookup.
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    if (payload.sub.startsWith("g:") && typeof payload.email === "string") {
      return { id: payload.sub, email: payload.email, name: String(payload.name ?? payload.email), phone: null, role: "CUSTOMER", points: 0, lifetimePts: 0 };
    }
    return await db.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, phone: true, role: true, points: true, lifetimePts: true },
    });
  } catch {
    return null;
  }
});

export async function requireUser(next = "/account") {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

// Stand-in identity while the admin is open for preview (no sign-in yet).
const PREVIEW_ADMIN: SessionUser = {
  id: "preview",
  email: "preview",
  name: "Admin preview",
  phone: null,
  role: "ADMIN",
  points: 0,
  lifetimePts: 0,
};

/** Admin role, or an email on the admin list (how Google sign-ins become admins). */
export async function isAdmin(user: SessionUser) {
  if (user.role === "ADMIN") return true;
  const { isAdminEmail } = await import("./admin-access");
  return isAdminEmail(user.email);
}

export async function requireAdmin() {
  const { ADMIN_PREVIEW } = await import("./admin-access");
  if (ADMIN_PREVIEW) return PREVIEW_ADMIN;
  const user = await getUser();
  if (!user) redirect("/login?next=/admin");
  // signed in but not an admin: they just get the normal website
  if (!(await isAdmin(user))) redirect("/");
  return user;
}

/** For server actions: throws instead of redirecting. On the read-only demo, bounces back with a notice. */
export async function assertAdmin() {
  const { ADMIN_PREVIEW, DEMO_READONLY } = await import("./admin-access");
  if (DEMO_READONLY) {
    const { headers } = await import("next/headers");
    const ref = (await headers()).get("referer");
    const path = ref ? new URL(ref).pathname : "/admin";
    redirect(`${path}?demo=1`);
  }
  if (ADMIN_PREVIEW) return PREVIEW_ADMIN;
  const user = await getUser();
  if (!user || !(await isAdmin(user))) throw new Error("Not authorised");
  return user;
}
