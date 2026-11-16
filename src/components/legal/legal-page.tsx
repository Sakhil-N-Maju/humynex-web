import Link from "next/link";
import clsx from "clsx";
import { PageHero, DarkCurve } from "@/components/brand/page-hero";
import { LEGAL, POLICIES } from "@/lib/legal";

/** Shared layout for the policy pages: white hero, links between policies, readable body. */
export function LegalPage({ path, title, intro, children }: { path: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <>
      <PageHero eyebrow={`Policies · Updated ${LEGAL.lastUpdated}`} title={title} sub={intro}>
        <nav aria-label="Policies" className="flex flex-wrap justify-center gap-2">
          {POLICIES.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              aria-current={p.href === path ? "page" : undefined}
              className={clsx(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                p.href === path ? "border-[#050816] bg-[#050816] text-white" : "border-[#050816]/15 text-[#050816]/70 hover:border-[#050816] hover:text-[#050816]",
              )}
            >
              {p.label}
            </Link>
          ))}
        </nav>
      </PageHero>
      <section
        data-theme="light"
        className="relative z-10 -mt-px bg-white px-5 pb-24 text-[#050816] md:px-8 md:pb-32"
      >
        <div className="mx-auto max-w-[760px] space-y-12 text-[1.02rem] leading-relaxed text-[#050816]/75 [&_a]:font-medium [&_a]:text-[#1E90FF] [&_a:hover]:underline [&_h2]:display [&_h2]:mb-3 [&_h2]:text-[1.6rem] [&_h2]:text-[#050816] [&_h3]:mb-1 [&_h3]:mt-5 [&_h3]:font-semibold [&_h3]:text-[#050816] [&_li]:pl-1 [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-[#050816] [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
          {children}
        </div>
      </section>
      <DarkCurve />
    </>
  );
}

/** "Contact us" block every policy ends with. */
export function LegalContact({ email, phone, address }: { email: string; phone: string; address: string[] }) {
  return (
    <section>
      <h2>Contact and grievances</h2>
      <p>
        {LEGAL.legalName} (trading as {LEGAL.brand}), {address.join(", ")}. GSTIN {LEGAL.gstin}.
      </p>
      <p>
        Grievance officer: {LEGAL.grievanceOfficer}. Email <a href={`mailto:${email}`}>{email}</a> or call{" "}
        <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>, Monday to Saturday. We acknowledge every complaint within 48 hours and
        resolve it within one month.
      </p>
    </section>
  );
}
