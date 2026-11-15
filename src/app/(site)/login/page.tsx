import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser, isAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/auth/auth-forms";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleSignIn, GoogleError } from "@/components/auth/google-button";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; google?: string }> }) {
  const { next: raw, google } = await searchParams;
  const next = raw?.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
  const user = await getUser();
  if (user) redirect((await isAdmin(user)) && next === "/account" ? "/admin" : next);

  return (
    <AuthCard title="Welcome" sub="Sign in to your Humynex account">
      <GoogleError error={google} />
      <LoginForm next={next}>
        <GoogleSignIn next={next === "/account" ? "" : next} />
      </LoginForm>
    </AuthCard>
  );
}
