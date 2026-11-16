import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import clsx from "clsx";
import { db } from "@/lib/db";
import { Reveal } from "@/components/fx/reveal";
import { PageHero, DarkBand, WhiteSheet, SectionLabel, btnBlue, btnOutlineDark } from "@/components/brand/page-hero";
import { projectCover } from "@/components/brand/project-cover";

export const metadata: Metadata = {
  title: "Projects",
  description: "The robots, platforms and research Humynex Robotics is building, from the iXi autonomous golf trolley to our perception engine.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await db.project.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { sortOrder: "asc" }] });
  const [lead, ...rest] = projects;

  return (
    <>
      <PageHero
        eyebrow={`Projects · ${projects.length} builds`}
        title="The work behind the workshop."
        sub="Products, platforms and research we've built or are building. Every one feeds back into the robots we rent and the parts we sell."
      />

      <DarkBand curve label="All projects">
        <div className="mx-auto max-w-[1400px]">
          <SectionLabel n="01" dark>Our works</SectionLabel>

          {lead && (
            <Reveal className="mt-10">
              <Link href={`/projects/${lead.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-clip rounded-[28px] md:aspect-[21/9]">
                  <Image
                    src={projectCover(lead.cover, 0)}
                    alt={lead.title}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover mono group-hover:scale-[1.02]"
                  />
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-white/50">
                      {lead.tag} · <span className="text-[#67D4FF]">{lead.status}</span> · {lead.year}
                    </p>
                    <h2 className="display-wide mt-3 text-[2.4rem] group-hover:text-[#67D4FF] md:text-[3.6rem]">{lead.title}</h2>
                    <p className="mt-3 max-w-[60ch] text-lg text-white/60">{lead.summary}</p>
                  </div>
                  <ArrowUpRight size={36} className="text-white/40 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#67D4FF]" />
                </div>
              </Link>
            </Reveal>
          )}

          <div className="mt-24 grid gap-x-8 gap-y-16 md:grid-cols-2">
            {rest.map((p, i) => (
              <Reveal key={p.id} delay={(i % 2) * 0.08} className={clsx(i % 2 === 1 && "md:mt-28")}>
                <Link href={`/projects/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-clip rounded-[24px]">
                    <Image
                      src={projectCover(p.cover, i + 1)}
                      alt={p.title}
                      fill
                      sizes="(min-width:768px) 50vw, 100vw"
                      className="object-cover mono group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="mt-5 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-white/50">
                    {p.tag} · <span className="text-[#67D4FF]">{p.status}</span> · {p.year}
                  </p>
                  <h2 className="display mt-2 text-3xl group-hover:text-[#67D4FF]">{p.title}</h2>
                  <p className="mt-2 max-w-[52ch] text-white/60">{p.summary}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </DarkBand>

      <div className="px-3 md:px-4">
        <WhiteSheet label="Custom builds" className="max-w-[1500px] text-center">
          <SectionLabel n="02">Custom builds</SectionLabel>
          <h2 className="display-wide mx-auto mt-5 max-w-[16ch] text-[2.4rem] md:text-[4.2rem]">Need something like this built for you?</h2>
          <p className="mx-auto mt-6 max-w-[54ch] text-lg text-[#050816]/65">
            Custom robots, automation rigs and complete robotics labs for schools and colleges. Scoped and priced after a short call.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/contact?topic=Custom%20project" className={btnBlue}>
              Talk to the team <ArrowUpRight size={16} weight="bold" />
            </Link>
            <Link href="/about" className={btnOutlineDark}>Meet the team</Link>
          </div>
        </WhiteSheet>
      </div>
    </>
  );
}
