import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { googleAuthUrl, googleConfigured, GOOGLE_STATE_COOKIE } from "@/lib/google";

export const dynamic = "force-dynamic";

/** Step 1: send the visitor to Google's account picker. */
export function GET(req: NextRequest) {
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL("/login?google=off", req.nextUrl.origin));
  }
  const raw = req.nextUrl.searchParams.get("next") ?? "";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "";
  const state = randomBytes(24).toString("base64url");
  const nonce = randomBytes(24).toString("base64url");
  const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;

  const res = NextResponse.redirect(googleAuthUrl({ redirectUri, state, nonce }));
  res.cookies.set(GOOGLE_STATE_COOKIE, JSON.stringify({ state, nonce, next }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
