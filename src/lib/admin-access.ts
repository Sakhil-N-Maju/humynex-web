import "server-only";
import { getSetting } from "./settings";
import { googleConfigured } from "./google";

/**
 * Who may use /admin.
 *
 * Admins sign in with Google. Anyone whose email is on the admin list gets
 * the admin panel; every other visitor (signed in or not) gets the normal site.
 *
 * Preview mode opens the admin without signing in, but only while Google
 * sign-in isn't set up yet, and only in development or on the UI-only demo.
 * A real production deployment always requires sign-in.
 */
export const DEMO_READONLY = process.env.NEXT_PUBLIC_DEMO_MODE === "1";
export const ADMIN_PREVIEW = (DEMO_READONLY || process.env.NODE_ENV !== "production") && !googleConfigured();

/** Always admins, whatever the admin list says, so the business can never lock itself out. */
export const OWNER_ADMINS = ["goldot.ai.solutions@gmail.com", "info@humynexrobotics.in"];

export function normaliseEmail(e: string) {
  return e.trim().toLowerCase();
}

/** Admin emails from the admin page, plus any bootstrap ones from ADMIN_EMAILS. */
export async function adminEmails() {
  const stored = await getSetting("admins");
  const fromEnv = (process.env.ADMIN_EMAILS ?? "").split(",").map(normaliseEmail).filter(Boolean);
  return [...new Set([...OWNER_ADMINS, ...fromEnv, ...stored.map(normaliseEmail)])];
}

export async function isAdminEmail(email: string) {
  return (await adminEmails()).includes(normaliseEmail(email));
}
