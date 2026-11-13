import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { db, parseJSON } from "@/lib/db";
import { Reveal } from "@/components/fx/reveal";
import { DarkBand, SectionLabel } from "@/components/brand/page-hero";
import { projectCover } from "@/components/brand/project-cover";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await db.project.findUnique({ where: { slug } });
  if (!p) return {};
  return { title: p.title, description: p.summary, alternates: { canonical: `/projects/${p.slug}` } };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = await db.project.findUnique({ where: { slug } });
  if (!p || !p.published) notFound();
  const all = await db.project.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
    select: { slug: true, title: true },
  });
  const idx = all.findIndex((x) => x.slug === p.slug);
  const next = all[(idx + 1) % all.length];
  const outcomes = parseJSON<string[]>(p.outcomes, []);
  const stack = parseJSON<string[]>(p.stack, []);

  return (
    <article>
      <header data-theme="light" className="bg-white px-5 pb-20 pt-32 text-[#050816] md:px-8 md:pb-24 md:pt-40">
        <div className="mx-auto max-w-[1400px]">
          <Link href="/projects" className="inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[#050816]/55 hover:text-[#1E90FF]">
            <ArrowLeft size={14} /> All projects
          </Link>
          <div className="mt-10 flex flex-col items-center text-center">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[#050816]/50">
              {p.tag} · <span className="text-[#1E90FF]">{p.status}</span> · {p.year}
            </p>
            <h1 className="display-wide mt-5 max-w-[16ch] text-[2.8rem] md:text-[clamp(3.4rem,6vw,5.6rem)]">{p.title}</h1>
            <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-[#050816]/65 md:text-xl">{p.summary}</p>
          </div>
          <div className="relative mt-14 aspect-[4/3] overflow-hidden rounded-[28px] md:aspect-[21/9]">
            <Image src={projectCover(p.cover, Math.max(idx, 0))} alt={p.title} fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      </header>

      <DarkBand curve label="Project details">
        <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[1fr_2fr]">
          <aside className="space-y-10">
            {p.client && (
              <div>
                <SectionLabel dark>Client</SectionLabel>
                <p className="mt-2 text-lg">{p.client}</p>
              </div>
            )}
            {stack.length > 0 && (
              <div>
                <SectionLabel dark>Built with</SectionLabel>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {stack.map((s) => (
                    <li key={s} className="rounded-full border border-white/15 px-3 py-1 text-sm text-white/80">{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
          <div>
            <div className="max-w-[64ch] space-y-5 text-lg leading-relaxed text-white/70">
              {p.body.split(/\n\s*\n/).map((para, i) => (
                <Reveal key={i}><p>{para}</p></Reveal>
              ))}
            </div>
            {outcomes.length > 0 && (
              <div className="mt-14 grid gap-3 sm:grid-cols-2">
                {outcomes.map((o, i) => (
                  <Reveal key={o} theme="light" delay={(i % 2) * 0.06} className="rounded-[24px] bg-white p-6 text-[#050816]">
                    <span className="font-mono text-sm text-[#1E90FF]">0{i + 1}</span>
                    <p className="mt-3 leading-relaxed">{o}</p>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>

        {next && next.slug !== p.slug && (
          <div className="mx-auto max-w-[1400px]">
            <Link href={`/projects/${next.slug}`} className="group mt-28 flex items-center justify-between border-t border-white/12 pt-10">
              <span>
                <SectionLabel dark>Next project</SectionLabel>
                <span className="display-wide mt-3 block text-[2.2rem] group-hover:text-[#67D4FF] md:text-[3.6rem]">{next.title}</span>
              </span>
              <ArrowRight size={40} className="shrink-0 text-white/40 transition-transform group-hover:translate-x-2 group-hover:text-[#67D4FF]" />
            </Link>
          </div>
        )}
      </DarkBand>
    </article>
  );
}
