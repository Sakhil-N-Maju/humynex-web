import { db, parseJSON } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { saveSettingsSection, saveMaterial } from "../actions";
import { PageHead, Flash, F, Check, SubmitButton, rupeesValue } from "@/components/admin/ui";

function Section({ id, title, sub, children }: { id: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 border-t border-line pt-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      {sub && <p className="mt-1 text-sm text-fg-2">{sub}</p>}
      <form action={saveSettingsSection} className="mt-5 space-y-5">
        <input type="hidden" name="section" value={id} />
        {children}
        <SubmitButton>Save {title.toLowerCase()}</SubmitButton>
      </form>
    </section>
  );
}

export default async function AdminContent({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [s, materials] = await Promise.all([getSettings(), db.printMaterial.findMany({ orderBy: { sortOrder: "asc" } })]);

  const jump = [
    ["hero", "Home hero"], ["announcement", "Announcement bar"], ["contact", "Contact"], ["mission", "Vision & mission"],
    ["stats", "Stats"], ["rewards", "Rewards"], ["shipping", "Shipping"], ["print", "3D print pricing"], ["materials", "Materials"],
  ];

  return (
    <div className="max-w-[900px]">
      <PageHead title="Content & settings" sub="Edit the words on the site and the rules behind rewards, shipping and printing." />
      <Flash sp={sp} />
      <nav className="mb-8 flex flex-wrap gap-2" aria-label="Sections">
        {jump.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-[4px] border border-line-2 px-2.5 py-1 text-xs text-fg-2 hover:text-fg">{label}</a>
        ))}
      </nav>

      <div className="space-y-12">
        <Section id="hero" title="Home hero" sub="Keep the headline under 10 words and the line under it under 25.">
          <F label="Headline" name="headline"><input id="headline" name="headline" defaultValue={s.hero.headline} className="input" /></F>
          <F label="Line under the headline" name="sub"><textarea id="sub" name="sub" rows={2} defaultValue={s.hero.sub} className="input" /></F>
        </Section>

        <Section id="announcement" title="Announcement bar" sub="The thin bar above the header. Hidden for signed-in customers.">
          <Check name="enabled" label="Show the bar" defaultChecked={s.announcement.enabled} />
          <F label="Text" name="text"><input id="text" name="text" defaultValue={s.announcement.text} className="input" /></F>
          <F label="Link" name="href"><input id="href" name="href" defaultValue={s.announcement.href} className="input font-mono" /></F>
        </Section>

        <Section id="contact" title="Contact" sub="Used in the footer, Contact page and legal pages.">
          <div className="grid gap-5 sm:grid-cols-2">
            <F label="Email" name="email"><input id="email" name="email" type="email" defaultValue={s.contact.email} className="input" /></F>
            <F label="Careers email" name="careersEmail"><input id="careersEmail" name="careersEmail" type="email" defaultValue={s.contact.careersEmail} className="input" /></F>
            <F label="Phone numbers" name="phones" hint="One per line."><textarea id="phones" name="phones" rows={2} defaultValue={s.contact.phones.join("\n")} className="input font-mono" /></F>
            <F label="Address" name="address" hint="One line per row."><textarea id="address" name="address" rows={3} defaultValue={s.contact.address.join("\n")} className="input" /></F>
            <F label="Opening hours" name="hours"><input id="hours" name="hours" defaultValue={s.contact.hours} className="input" /></F>
            <F label="Google Maps link" name="mapsUrl"><input id="mapsUrl" name="mapsUrl" defaultValue={s.contact.mapsUrl} className="input" /></F>
            <F label="Instagram URL" name="instagram"><input id="instagram" name="instagram" defaultValue={s.contact.social.instagram} className="input" /></F>
            <F label="LinkedIn URL" name="linkedin"><input id="linkedin" name="linkedin" defaultValue={s.contact.social.linkedin} className="input" /></F>
            <F label="YouTube URL" name="youtube"><input id="youtube" name="youtube" defaultValue={s.contact.social.youtube} className="input" /></F>
          </div>
          <p className="text-xs text-fg-3">Social links only appear in the footer once they have a URL.</p>
        </Section>

        <Section id="mission" title="Vision & mission">
          <F label="Vision headline" name="vision"><input id="vision" name="vision" defaultValue={s.mission.vision} className="input" /></F>
          <F label="Vision text" name="visionBody"><textarea id="visionBody" name="visionBody" rows={3} defaultValue={s.mission.visionBody} className="input" /></F>
          <F label="Mission headline" name="mission" hint='The words "intelligence layer" are highlighted on the home page when present.'><input id="mission" name="mission" defaultValue={s.mission.mission} className="input" /></F>
          <F label="Mission text" name="missionBody"><textarea id="missionBody" name="missionBody" rows={3} defaultValue={s.mission.missionBody} className="input" /></F>
          <F label="Pull quote" name="quote"><textarea id="quote" name="quote" rows={2} defaultValue={s.mission.quote} className="input" /></F>
        </Section>

        <Section id="stats" title="Stats" sub="The three numbers on the home and About pages. Only publish numbers you can stand behind.">
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid grid-cols-[100px_80px_1fr] gap-3">
              <F label="Number" name={`value${i}`}><input id={`value${i}`} name={`value${i}`} type="number" defaultValue={s.stats[i]?.value ?? ""} className="input font-mono" /></F>
              <F label="Suffix" name={`suffix${i}`}><input id={`suffix${i}`} name={`suffix${i}`} defaultValue={s.stats[i]?.suffix ?? ""} className="input font-mono" /></F>
              <F label="Label" name={`label${i}`}><input id={`label${i}`} name={`label${i}`} defaultValue={s.stats[i]?.label ?? ""} className="input" /></F>
            </div>
          ))}
        </Section>

        <Section id="rewards" title="Rewards" sub="One point is always worth ₹1.">
          <div className="grid gap-5 sm:grid-cols-3">
            <F label="Signup bonus (points)" name="signupBonus"><input id="signupBonus" name="signupBonus" type="number" min={0} defaultValue={s.rewards.signupBonus} className="input font-mono" /></F>
            <F label="Points per ₹100 paid" name="pointsPer100"><input id="pointsPer100" name="pointsPer100" type="number" min={0} defaultValue={s.rewards.pointsPer100} className="input font-mono" /></F>
            <F label="Max % of order payable" name="maxRedeemPct"><input id="maxRedeemPct" name="maxRedeemPct" type="number" min={0} max={100} defaultValue={s.rewards.maxRedeemPct} className="input font-mono" /></F>
          </div>
        </Section>

        <Section id="shipping" title="Shipping">
          <div className="grid gap-5 sm:grid-cols-2">
            <F label="Free shipping above (₹)" name="freeAbove"><input id="freeAbove" name="freeAbove" inputMode="decimal" defaultValue={rupeesValue(s.shipping.freeAbove)} className="input font-mono" /></F>
            <F label="Flat shipping fee (₹)" name="flat"><input id="flat" name="flat" inputMode="decimal" defaultValue={rupeesValue(s.shipping.flat)} className="input font-mono" /></F>
          </div>
        </Section>

        <Section id="print" title="3D print pricing" sub="Price = material grams x material rate + print hours x machine rate + setup fee, with a minimum.">
          <div className="grid gap-5 sm:grid-cols-3">
            <F label="Setup fee per job (₹)" name="setupFee"><input id="setupFee" name="setupFee" inputMode="decimal" defaultValue={rupeesValue(s.print.setupFee)} className="input font-mono" /></F>
            <F label="Machine rate per hour (₹)" name="machineRate"><input id="machineRate" name="machineRate" inputMode="decimal" defaultValue={rupeesValue(s.print.machineRate)} className="input font-mono" /></F>
            <F label="Minimum job (₹)" name="minOrder"><input id="minOrder" name="minOrder" inputMode="decimal" defaultValue={rupeesValue(s.print.minOrder)} className="input font-mono" /></F>
            <F label="Bed X (mm)" name="bedX"><input id="bedX" name="bedX" type="number" defaultValue={s.print.bed.x} className="input font-mono" /></F>
            <F label="Bed Y (mm)" name="bedY"><input id="bedY" name="bedY" type="number" defaultValue={s.print.bed.y} className="input font-mono" /></F>
            <F label="Bed Z (mm)" name="bedZ"><input id="bedZ" name="bedZ" type="number" defaultValue={s.print.bed.z} className="input font-mono" /></F>
          </div>
          <F label="Turnaround text" name="turnaround"><input id="turnaround" name="turnaround" defaultValue={s.print.turnaround} className="input" /></F>
        </Section>

        <section id="materials" className="scroll-mt-6 border-t border-line pt-8">
          <h2 className="text-lg font-semibold">Print materials</h2>
          <p className="mt-1 text-sm text-fg-2">Density is in g/cm³. Colours are comma-separated.</p>
          <div className="mt-5 space-y-4">
            {[...materials, null].map((m, i) => (
              <form key={m?.id ?? "new"} action={saveMaterial} className="grid gap-3 rounded-[4px] border border-line p-4 sm:grid-cols-[90px_1fr_90px_100px]">
                {m && <input type="hidden" name="id" value={m.id} />}
                <F label="Code" name={`code-${i}`}><input id={`code-${i}`} name="code" required defaultValue={m?.code ?? ""} className="input h-10 font-mono" /></F>
                <F label="Name" name={`name-${i}`}><input id={`name-${i}`} name="name" required defaultValue={m?.name ?? ""} className="input h-10" /></F>
                <F label="Density" name={`density-${i}`}><input id={`density-${i}`} name="density" inputMode="decimal" defaultValue={m?.density ?? ""} className="input h-10 font-mono" /></F>
                <F label="₹ per gram" name={`ppg-${i}`}><input id={`ppg-${i}`} name="pricePerG" inputMode="decimal" defaultValue={m ? rupeesValue(m.pricePerG) : ""} className="input h-10 font-mono" /></F>
                <F label="Description" name={`desc-${i}`} className="sm:col-span-2"><input id={`desc-${i}`} name="description" defaultValue={m?.description ?? ""} className="input h-10" /></F>
                <F label="Colours" name={`colors-${i}`} className="sm:col-span-2"><input id={`colors-${i}`} name="colors" defaultValue={parseJSON<string[]>(m?.colors, []).join(", ")} className="input h-10" /></F>
                <div className="flex items-center gap-5 sm:col-span-4">
                  <Check name="active" label="Offered" defaultChecked={m?.active ?? true} />
                  <label className="flex items-center gap-2 text-sm">Order <input name="sortOrder" type="number" defaultValue={m?.sortOrder ?? materials.length + 1} className="input h-8 w-16 font-mono" /></label>
                  <SubmitButton className="ml-auto">{m ? "Save" : "Add material"}</SubmitButton>
                </div>
              </form>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
