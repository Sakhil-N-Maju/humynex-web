import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { SignupForm } from "@/components/auth/auth-forms";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleSignIn } from "@/components/auth/google-button";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Join Humynex Robotics and get reward points on every parts order, robot rental and 3D print.",
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next: raw } = await searchParams;
  const next = raw?.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
  if (await getUser()) redirect(next);
  const rewards = await getSetting("rewards");

  return (
    <AuthCard title="Join us" sub={`Create your account and get ₹${rewards.signupBonus} to spend`}>
      <SignupForm next={next} bonus={rewards.signupBonus}>
        <GoogleSignIn next={next === "/account" ? "" : next} />
      </SignupForm>
    </AuthCard>
  );
}
