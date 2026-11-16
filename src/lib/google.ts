import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Google sign-in (OpenID Connect, authorization code flow) without a library.
 * Needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from Google Cloud Console,
 * with <site>/api/auth/google/callback as an authorised redirect URI.
 */
export const GOOGLE_STATE_COOKIE = "hmx_oauth";

export function googleConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/** Sessions are signed with AUTH_SECRET; without it a sign-in can't be completed. */
export function sessionsConfigured() {
  return (process.env.AUTH_SECRET ?? "").length >= 32;
}

export function googleAuthUrl({ redirectUri, state, nonce }: { redirectUri: string; state: string; nonce: string }) {
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    nonce,
    prompt: "select_account",
  }).toString();
  return u.toString();
}

const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

/** Swap the one-time code for an ID token and verify it. Returns the verified Google profile. */
export async function googleProfileFromCode({ code, redirectUri, nonce }: { code: string; redirectUri: string; nonce: string }) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    // Google's error code and description only, never the secret or code
    const body = (await res.json().catch(() => ({}))) as { error?: string; error_description?: string };
    throw new Error(`Google token exchange failed (${res.status}): ${body.error ?? "?"} ${body.error_description ?? ""}`.trim());
  }
  const { id_token } = (await res.json()) as { id_token?: string };
  if (!id_token) throw new Error("Google returned no ID token");

  const { payload } = await jwtVerify(id_token, JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: process.env.GOOGLE_CLIENT_ID!,
  });
  if (payload.nonce !== nonce) throw new Error("Sign-in nonce mismatch");
  if (payload.email_verified !== true || typeof payload.email !== "string") throw new Error("Google email not verified");

  return {
    email: payload.email.toLowerCase(),
    name: typeof payload.name === "string" && payload.name ? payload.name : payload.email.split("@")[0],
  };
}
