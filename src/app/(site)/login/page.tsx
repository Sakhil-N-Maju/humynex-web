import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next: raw } = await searchParams;
  const next = raw?.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
  const user = await getUser();
  if (user) redirect(user.role === "ADMIN" && next === "/account" ? "/admin" : next);

  return (
    <div className="mx-auto grid max-w-[1100px] gap-12 px-4 pt-16 md:grid-cols-2 md:px-8">
      <div>
        <h1 className="display-wide text-4xl md:text-5xl">Welcome back.</h1>
        <p className="mt-4 max-w-[40ch] text-fg-2">Sign in to see your orders, rental bookings, print jobs and reward points.</p>
        <div className="mt-10 max-w-[420px]">
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
