import type { Metadata } from "next";
import { EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { getSetting } from "@/lib/settings";
import { Reveal } from "@/components/fx/reveal";
import { DarkCurve } from "@/components/brand/page-hero";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to Humynex Robotics about parts, robot rentals, 3D printing, custom builds or robotics lab setups.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const [{ topic }, c] = await Promise.all([searchParams, getSetting("contact")]);
  const detailHead = "flex items-center gap-3 text-[1.6rem] font-medium tracking-[-0.02em]";

  return (
    <>
      <section data-theme="light" className="bg-white px-5 pb-28 pt-36 text-[#050816] md:px-8 md:pb-40 md:pt-44">
        <div className="mx-auto grid max-w-[1300px] gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div>
            <p className="flex items-center gap-3 font-mono text-[0.78rem] uppercase tracking-[0.1em] lg:sticky lg:top-32">
              <span className="size-2.5 rounded-full bg-[#050816]" aria-hidden="true" />
              Start with a step
            </p>
          </div>

          <div>
            <Reveal>
              <h1 className="display-wide text-[3.4rem] leading-[0.95] md:text-[clamp(4.5rem,8vw,7.5rem)]">Let&apos;s connect</h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-6 max-w-[34ch] text-xl leading-snug text-[#050816]/80 md:text-[1.75rem]">
                Tell us what you want to build, rent or print. We reply within one working day.
              </p>
            </Reveal>

            <Reveal delay={0.14} className="mt-14">
              <ContactForm defaultTopic={topic} />
            </Reveal>

            <div className="mt-20 grid gap-12 sm:grid-cols-2">
              <Reveal>
                <h2 className={detailHead}>
                  <MapPin size={22} /> Address
                </h2>
                <address className="mt-4 text-lg not-italic leading-relaxed text-[#050816]/75">
                  {c.address.map((l) => (
                    <span key={l} className="block">{l}</span>
                  ))}
                </address>
                <a href={c.mapsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[#050816] underline underline-offset-4 hover:text-[#1E90FF]">
                  Open in Maps
                </a>
              </Reveal>

              <Reveal delay={0.06}>
                <h2 className={detailHead}>
                  <EnvelopeSimple size={22} /> Contact
                </h2>
                <a href={`mailto:${c.email}`} className="mt-4 inline-block text-lg underline underline-offset-4 hover:text-[#1E90FF]">
                  {c.email}
                </a>
                <ul className="mt-4 space-y-1.5">
                  {c.phones.map((p) => (
                    <li key={p}>
                      <a href={`tel:${p.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 text-lg text-[#050816]/75 hover:text-[#1E90FF]">
                        <Phone size={16} /> {p}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-[#050816]/50">{c.hours}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
      <DarkCurve />
    </>
  );
}
