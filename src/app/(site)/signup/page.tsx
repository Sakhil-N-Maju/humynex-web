import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { TIERS } from "@/lib/tiers";
import { SignupForm } from "@/components/auth/auth-forms";

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
    <div className="mx-auto grid max-w-[1100px] gap-14 px-4 pt-16 md:grid-cols-[1fr_1fr] md:px-8">
      <div>
        <h1 className="display-wide text-4xl md:text-5xl">
          Join and get <span className="text-volt-hi">₹{rewards.signupBonus}</span> to spend.
        </h1>
        <p className="mt-4 max-w-[44ch] text-fg-2">
          New accounts start with {rewards.signupBonus} reward points. After that you earn {rewards.pointsPer100} points for every ₹100 you spend. One point is one rupee off, on up to {rewards.maxRedeemPct}% of any order.
        </p>
        <ol className="mt-10 space-y-5">
          {TIERS.map((t) => (
            <li key={t.name} className="flex gap-4">
              <span className="w-24 shrink-0 font-mono text-sm text-fg-3">{t.min.toLocaleString("en-IN")}+</span>
              <span>
                <span className="font-semibold">{t.name}</span>
                <span className="block text-sm text-fg-2">{t.perk}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="surface h-fit p-6 md:p-8">
        <SignupForm next={next} bonus={rewards.signupBonus} />
      </div>
    </div>
  );
}
