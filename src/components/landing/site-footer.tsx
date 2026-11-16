import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Wordmark } from "./wordmark";

type Social = { label: string; href: string };

/**
 * Closing call to action, link columns, then the brand set as large as the
 * screen allows and cropped at the bottom edge.
 */
export function SiteFooter({ socials, phone, email, address }: { socials: Social[]; phone: string; email: string; address: string[] }) {
  const nav = [
    ["Home", "/"],
    ["Shop", "/shop"],
    ["Rentals", "/rentals"],
    ["3D Print", "/print"],
    ["Projects", "/projects"],
    ["About", "/about"],
    ["Contact", "/contact"],
  ];
  const explore: Social[] = socials.length
    ? socials
    : [
        { label: "My account", href: "/account" },
        { label: "Checkout", href: "/checkout" },
        { label: "Terms", href: "/terms" },
        { label: "Privacy", href: "/privacy" },
        { label: "Refunds", href: "/refund-policy" },
        { label: "Shipping", href: "/shipping-policy" },
      ];

  const head = "mb-4 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-[#050816]/50";
  const link = "block py-1 text-[0.95rem] font-medium uppercase tracking-[0.02em] text-[#050816] transition-colors hover:text-[#1E90FF]";

  return (
    <footer data-theme="light" className="relative mt-8 overflow-hidden rounded-t-[32px] bg-white text-[#050816] md:rounded-t-[48px]">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-14 px-5 pt-28 md:flex-row md:items-start md:justify-between md:px-8 md:pt-36">
        <div>
          <h2 className="display max-w-[14ch] text-[2.6rem] uppercase leading-[0.95] md:text-[3.6rem]">
            Ready to start your build?
          </h2>
          <p className="mt-4 max-w-[36ch] text-[#050816]/65">Tell us what you need. We reply within one working day.</p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center gap-2 bg-[#1E90FF] px-6 font-mono text-sm font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#1A7FE6]"
          >
            Start a project <ArrowUpRight size={16} weight="bold" />
          </Link>
        </div>

        <div className="flex gap-16 md:gap-20">
          <nav aria-label="Footer">
            <p className={head}>Navigation</p>
            {nav.map(([l, h]) => (
              <Link key={h} href={h} className={link}>
                {l}
              </Link>
            ))}
          </nav>
          <div>
            <p className={head}>{socials.length ? "Socials" : "More"}</p>
            {explore.map((s) =>
              s.href.startsWith("http") ? (
                <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className={link}>
                  {s.label}
                </a>
              ) : (
                <Link key={s.href} href={s.href} className={link}>
                  {s.label}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-[1500px] flex-wrap gap-x-8 gap-y-2 px-5 text-sm text-[#050816]/55 md:px-8">
        <span>{address.join(", ")}</span>
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-[#1E90FF]">{phone}</a>
        <a href={`mailto:${email}`} className="hover:text-[#1E90FF]">{email}</a>
        <span className="md:ml-auto">© {new Date().getFullYear()} Humynex Robotics</span>
        <Link href="/terms" className="hover:text-[#1E90FF]">Terms</Link>
        <Link href="/privacy" className="hover:text-[#1E90FF]">Privacy</Link>
        <Link href="/refund-policy" className="hover:text-[#1E90FF]">Refunds</Link>
        <Link href="/shipping-policy" className="hover:text-[#1E90FF]">Shipping</Link>
      </div>

      {/* The brand, edge to edge, cropped at the bottom like a stamp */}
      <div className="mt-10 h-[11vw] overflow-hidden px-2 md:mt-14 md:px-4" aria-hidden="true">
        <Wordmark text="HUMYNEX" className="block w-full text-[#e6ecf5]" />
      </div>
    </footer>
  );
}
