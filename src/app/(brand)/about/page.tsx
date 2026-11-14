import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Reveal } from "@/components/fx/reveal";
import { PageHero, DarkBand, WhiteSheet, SectionLabel, btnBlue, btnNavy } from "@/components/brand/page-hero";

export const metadata: Metadata = {
  title: "About Humynex Robotics",
  description: "Meet the team in Kalady, Kerala building autonomous machines, robotics parts and event robots.",
  alternates: { canonical: "/about" },
};


function initials(name: string, role: string) {
  const src = name === "Team member" ? role : name;
  return src
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * Brand-blue accents in the vision line, like a marker pass: "objects" gets a
 * filled pill, "alongside" turns blue. If an admin rewrites the line and the
 * words are gone, it simply renders plain.
 */
function highlightVision(text: string) {
  return text.split(/(\s+)/).map((part, i) => {
    const word = part.toLowerCase().replace(/[^a-z]/g, "");
    if (word === "objects")
      return (
        <span key={i} className="inline-block rounded-[0.4em] bg-[#1E90FF] px-[0.18em] pb-[0.06em] leading-[1.05] text-white">
          {part}
        </span>
      );
    if (word === "alongside")
      return (
        <span key={i} className="text-[#1E90FF]">
          {part}
        </span>
      );
    return part;
  });
}

export default async function AboutPage() {
  const [s, team] = await Promise.all([
    getSettings(),
    db.teamMember.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  const realCount = team.filter((m) => !m.isPlaceholder).length;
  // once real profiles exist, placeholder cards drop out automatically
  const shown = realCount > 0 ? team.filter((m) => !m.isPlaceholder) : team;

  return (
    <>
      <PageHero eyebrow="About · Kalady, Kerala" title={highlightVision(s.mission.vision)} sub={s.mission.visionBody} />


      <DarkBand curve label="Mission">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal>
            <SectionLabel n="01" dark>Mission</SectionLabel>
            <h2 className="display-wide mt-5 text-[2.4rem] md:text-[3.6rem]">{s.mission.mission}</h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:pt-12">
            <p className="text-lg leading-relaxed text-white/65">{s.mission.missionBody}</p>
            <blockquote className="display mt-12 border-l-2 border-[#1E90FF] pl-6 text-[1.7rem] leading-snug md:text-[2rem]">
              &ldquo;{s.mission.quote}&rdquo;
            </blockquote>
          </Reveal>
        </div>
      </DarkBand>

      <div className="px-3 md:px-4">
        <WhiteSheet id="team" label="The people" className="max-w-[1500px]">
          <div className="mx-auto max-w-[1300px]">
            <div className="text-center">
              <SectionLabel n="02">The people</SectionLabel>
              <h2 className="display-wide mx-auto mt-5 max-w-[14ch] text-[2.4rem] md:text-[4rem]">One lab, one team, in Kalady.</h2>
              <p className="mx-auto mt-5 max-w-[48ch] text-lg text-[#050816]/65">Engineers, designers and operators building the machines we sell, rent and ship.</p>
            </div>
            <ul className="mt-16 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((m, i) => (
                <Reveal as="li" key={m.id} delay={(i % 3) * 0.06}>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-[#f2f5fa]">
                    {m.photo ? (
                      <Image src={m.photo} alt={m.name} fill sizes="(min-width:1024px) 33vw, 50vw" className="object-cover grayscale transition duration-700 hover:grayscale-0" />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center">
                        <span className="display-wide text-7xl text-[#050816]/12" aria-hidden="true">{initials(m.name, m.role)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-3 px-1">
                    <div>
                      <h3 className="text-lg font-semibold">{m.isPlaceholder ? m.role : m.name}</h3>
                      <p className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-[#1E90FF]">{m.isPlaceholder ? "Profile coming soon" : m.role}</p>
                    </div>
                    {m.linkedin && (
                      <a href={m.linkedin} target="_blank" rel="noreferrer" aria-label={`${m.name} on LinkedIn`} className="text-[#050816]/45 hover:text-[#1E90FF]">
                        <LinkedinLogo size={22} />
                      </a>
                    )}
                  </div>
                  <p className="mt-2 px-1 text-sm leading-relaxed text-[#050816]/65">{m.bio}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </WhiteSheet>
      </div>

      <DarkBand label="Principles" className="overflow-hidden !py-28 md:!py-36">
        {/* faint vertical rules behind the cards */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 mx-auto grid max-w-[1400px] grid-cols-2 px-5 md:px-8 lg:grid-cols-4">
          {[0, 1, 2, 3].map((n) => (
            <span key={n} className={`border-l border-white/[0.06] ${n === 3 ? "border-r" : ""} ${n > 1 ? "hidden lg:block" : ""} ${n === 1 ? "max-lg:border-r" : ""}`} />
          ))}
        </div>

        <div className="relative mx-auto max-w-[1400px]">
          <div className="text-center">
            <SectionLabel n="03" dark>Principles</SectionLabel>
            <h2 className="display-wide mt-5 text-[2.6rem] md:text-[4.2rem]">What we hold to</h2>
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {s.pillars.map((p, i) => (
              <Reveal
                key={p.title}
                delay={i * 0.07}
                className="flex flex-col items-center rounded-[28px] bg-[#0f1630] px-7 pb-12 pt-10 text-center transition-colors duration-500 hover:bg-[#141d3d]"
              >
                <span className="grid size-12 place-items-center rounded-full bg-[#1E90FF] font-mono text-sm font-semibold text-[#050816]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="display mt-10 text-[1.4rem] md:text-[1.55rem]">{p.title}</h3>
                <p className="mt-3 max-w-[28ch] leading-relaxed text-white/60">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </DarkBand>

      <div className="px-3 md:px-4">
        <WhiteSheet label="Join or visit" className="max-w-[1500px]">
          <div className="mx-auto grid max-w-[1300px] gap-14 md:grid-cols-2">
            <div>
              <SectionLabel n="04">Careers</SectionLabel>
              <h2 className="display-wide mt-5 text-[2.2rem] md:text-[3rem]">Work with us.</h2>
              <p className="mt-4 max-w-[46ch] text-lg text-[#050816]/65">
                We hire engineers, designers and field operators. If you like building things that move, send your CV.
              </p>
              <a href={`mailto:${s.contact.careersEmail}`} className={`${btnNavy} mt-8`}>{s.contact.careersEmail}</a>
            </div>
            <div>
              <SectionLabel n="05">Visit</SectionLabel>
              <h2 className="display-wide mt-5 text-[2.2rem] md:text-[3rem]">Visit the lab.</h2>
              <address className="mt-4 max-w-[36ch] text-lg not-italic text-[#050816]/65">{s.contact.address.join(", ")}</address>
              <Link href="/contact" className={`${btnBlue} mt-8`}>Talk to the team</Link>
            </div>
          </div>
        </WhiteSheet>
      </div>
    </>
  );
}
