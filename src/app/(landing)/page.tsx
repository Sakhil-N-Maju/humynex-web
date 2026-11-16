import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { SiteChrome } from "@/components/site/site-chrome";
import { Stage } from "@/components/landing/stage";
import { ServiceStack, type Service } from "@/components/landing/service-stack";
import { Faq } from "@/components/landing/faq";
import { SiteFooter } from "@/components/landing/site-footer";
import { TrustSection } from "@/components/landing/trust-section";
import { WorksSection } from "@/components/landing/works-section";
import { ProcessTimeline } from "@/components/landing/process-timeline";
import { Reveal } from "@/components/fx/reveal";

export const metadata: Metadata = {
  title: { absolute: "Humynex Robotics: robotics parts, robot rentals and 3D printing in Kerala" },
  alternates: { canonical: "/" },
};

// Order matters: custom building is the core business, so it leads.
const SERVICES: Service[] = [
  {
    key: "custom",
    title: "Custom robots and automation",
    line: "Tell us the job. We design, build and deliver the machine that does it.",
    points: [
      "Mechanical, electronics, firmware and enclosure from one team",
      "Prototypes, one-off machines and small production runs",
      "Scoped and priced after a short call",
      "Built on the same autonomy work behind iXi",
    ],
    bestFor: "businesses, startups and research teams",
    href: "/projects",
    cta: "See what we've built",
  },
  {
    key: "lab",
    title: "Robotics lab setups",
    line: "A working robotics lab for your school or college, from kits to benches.",
    points: [
      "Kits, controllers and tools chosen for your syllabus",
      "Rover and arm kits designed in our own lab",
      "Installed and handed over working",
      "Parts restocked from our shop",
    ],
    bestFor: "schools, colleges and training centres",
    href: "/contact?topic=Lab%20setup",
    cta: "Plan your lab",
  },
  {
    key: "parts",
    title: "Electronics and robot parts",
    line: "Boards, motors, sensors and kits from our own stock.",
    points: ["Microcontrollers, sensors, motors and drivers", "Batteries, power and accessories", "Ships in 2 working days, free over ₹999"],
    bestFor: "makers, students and project teams",
    href: "/shop",
    cta: "Shop parts",
  },
  {
    key: "rentals",
    title: "Robot rentals",
    line: "A robot dog, serving robot or robot costume for your event.",
    points: ["Operator, setup and transport included", "Book dates online with a refundable deposit", "Evening and weekend events covered"],
    bestFor: "fests, weddings, launches and expos",
    href: "/rentals",
    cta: "See the fleet",
  },
  {
    key: "print",
    title: "3D printing",
    line: "Upload a model and get a final price in seconds.",
    points: ["PLA, PETG, ABS, TPU and carbon-filled PLA", "256 mm build volume, larger parts split", "Ready in 2 to 4 working days"],
    bestFor: "prototypes, enclosures and project parts",
    href: "/print",
    cta: "Get a print quote",
  },
];

const PROCESS = [
  { title: "Tell us what you need", body: "Order online, pick rental dates, upload a model, or send us a brief.", time: "Reply within 1 working day" },
  { title: "Get a clear price", body: "Parts, rentals and prints are priced online. Custom work is scoped and quoted after a short call.", time: "Instant online, custom after a call" },
  { title: "We deliver", body: "Parts ship, prints come off the printer, and rental robots arrive with an operator before your event.", time: "Parts in 2 days, prints in 2 to 4" },
  { title: "We stay on call", body: "Faulty parts are replaced, rental deposits are refunded, and an engineer picks up if you get stuck.", time: "7-day replacement on parts" },
];

export default async function LandingPage() {
  const [s, projects] = await Promise.all([
    getSettings(),
    db.project.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { sortOrder: "asc" }], take: 6 }),
  ]);
  const phone = s.contact.phones[0] ?? "";
  const works = projects.map((p) => ({ slug: p.slug, title: p.title, year: p.year, cover: p.cover }));

  const facts = [
    ...s.stats.map((st) => ({ value: st.value, suffix: st.suffix, label: st.label })),
  ];

  return (
    <>
      <SiteChrome />

      <main className="bg-[#050816] text-white">
        <Stage
          headline={s.landing.headline}
          sub={s.landing.sub}
          phone={phone}
        />

        {/* Every service, stacking as you scroll. On desktop it overlaps the
            empty lower half of the full-screen panel so the first card sits
            right under the services heading. */}
        <section aria-label="Our services" data-theme="dark" className="relative z-10 pb-24 pt-10 md:-mt-[75vh] md:pt-0">
          <ServiceStack services={SERVICES} />
        </section>

        {/* Trust: white sheet that rises over the navy services (parallax) */}
        <TrustSection facts={facts} clients={s.clients} badges={s.badges} />

        {/* Our works: pinned heading, six projects drifting up over it */}
        <WorksSection works={works} />

        {s.testimonials.length > 0 && (
          <section aria-label="What clients say" data-theme="dark" className="mx-auto max-w-[1400px] px-5 pb-28 md:px-10">
              <ul className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {s.testimonials.map((t) => (
                  <li key={t.name} className="rounded-[18px] border border-white/12 p-7">
                    <blockquote className="text-lg leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
                    <p className="mt-5 text-sm">
                      <span className="font-medium">{t.name}</span>
                      <span className="block text-white/55">{t.role}, {t.org}</span>
                    </p>
                  </li>
                ))}
              </ul>
          </section>
        )}

        {/* Process: white rounded sheet with a curved, scroll-drawn timeline */}
        <section
          id="process"
          aria-labelledby="process-title"
          data-theme="light"
          className="relative z-10 mt-24 scroll-mt-24 rounded-[32px] bg-white text-[#050816] md:mt-32 md:rounded-[48px]"
        >
          <div className="mx-auto max-w-[1200px] px-5 pb-24 pt-24 md:px-10 md:pb-32 md:pt-32">
            <Reveal>
              <h2 id="process-title" className="display mx-auto max-w-[16ch] text-center text-4xl md:text-6xl">
                How working with us goes.
              </h2>
            </Reveal>
            <div className="mt-16 md:mt-24">
              <ProcessTimeline steps={PROCESS} />
            </div>
          </div>
        </section>

        {/* FAQ: dark */}
        <section
          id="faq"
          aria-labelledby="faq-title"
          data-theme="dark"
          className="relative z-10 scroll-mt-24 bg-[#050816] text-white"
        >
          <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-24 md:px-10 md:py-36 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
            <div>
              <p className="font-mono text-sm text-white/60">(05) FAQ</p>
              <h2 id="faq-title" className="display-wide mt-6 text-[3.4rem] leading-[0.92] md:text-[clamp(4rem,7vw,6.5rem)]">
                Frequently
                <br />
                Asked
                <br />
                Questions
              </h2>
            </div>
            <div className="lg:pt-2">
              <Faq items={s.faq} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter
        socials={Object.entries(s.contact.social)
          .filter(([, url]) => url)
          .map(([name, url]) => ({ label: name, href: url }))}
        phone={phone}
        email={s.contact.email}
        address={s.contact.address}
      />
    </>
  );
}
