import type { Metadata } from "next";
import { db, parseJSON } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getUser } from "@/lib/auth";
import { formatINR } from "@/lib/money";
import { Reveal } from "@/components/fx/reveal";
import { PageHero, DarkBand, WhiteSheet, SectionLabel, btnBlue } from "@/components/brand/page-hero";
import { Quoter } from "./quoter";

export const metadata: Metadata = {
  title: "3D printing service with instant quotes",
  description: "Upload an STL or OBJ and get an instant 3D print price in PLA, PETG, ABS, TPU or carbon-filled PLA. Printed in Kalady, shipped across India.",
  alternates: { canonical: "/print" },
};

export default async function PrintPage() {
  const [settings, materials, user] = await Promise.all([
    getSettings(),
    db.printMaterial.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getUser(),
  ]);
  const p = settings.print;

  const notes = [
    ["Material", "We estimate the grams of filament from your model's volume, wall thickness and infill, then charge by the gram for the material you pick."],
    ["Machine time", `Finer layers take longer. Machine time is ${formatINR(p.machineRate)} an hour, plus ${formatINR(p.setupFee)} setup per job.`],
    ["Too big for the bed?", `Our bed is ${p.bed.x} x ${p.bed.y} x ${p.bed.z} mm. Larger parts can be split and joined, so send it anyway and we'll quote by hand.`],
    ["Your files stay private", "Models are stored off the public site, used only for your job, and never shared."],
  ];

  return (
    <>
      <PageHero
        eyebrow="3D Print · Instant quote"
        title="3D printing, priced in seconds."
        sub={`Drop in a model, choose material and finish, and the price updates as you go. Jobs start at ${formatINR(p.minOrder)} and are ready in ${p.turnaround.toLowerCase()}.`}
      >
        <a href="#quote" className={btnBlue}>Upload a model</a>
      </PageHero>

      <DarkBand curve id="quote" label="Get a quote">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel n="01" dark>Your quote</SectionLabel>
              <h2 className="display-wide mt-4 text-[2.4rem] md:text-[3.6rem]">Upload, tune, pay.</h2>
            </div>
            <p className="max-w-[40ch] text-white/60">STL or OBJ up to 60 MB. The price is final for parts that fit our {p.bed.x} mm bed.</p>
          </div>
          <Quoter
            materials={materials.map((m) => ({ code: m.code, name: m.name, description: m.description, density: m.density, pricePerG: m.pricePerG, colors: parseJSON<string[]>(m.colors, []) }))}
            cfg={p}
            user={user ? { name: user.name, email: user.email, phone: user.phone ?? "" } : null}
          />
        </div>
      </DarkBand>

      <div className="px-3 md:px-4">
        <WhiteSheet label="How the price works" className="max-w-[1500px]">
          <div className="mx-auto grid max-w-[1300px] gap-14 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <SectionLabel n="02">Pricing</SectionLabel>
              <h2 className="display-wide mt-5 max-w-[12ch] text-[2.4rem] md:text-[3.6rem]">How the price works.</h2>
            </div>
            <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
              {notes.map(([h, b], i) => (
                <Reveal key={h} delay={(i % 2) * 0.08}>
                  <span className="font-mono text-sm text-[#1E90FF]">0{i + 1}</span>
                  <h3 className="display mt-3 border-t border-[#050816]/12 pt-5 text-2xl">{h}</h3>
                  <p className="mt-3 leading-relaxed text-[#050816]/65">{b}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </WhiteSheet>
      </div>
    </>
  );
}
