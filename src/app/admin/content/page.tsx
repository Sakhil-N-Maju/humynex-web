import { db, parseJSON } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { saveMaterial } from "../actions";
import { PageHead, Flash, F, Check, Card, SubmitButton, rupeesValue } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";

const BACK = "/admin/content";

export default async function AdminContent({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [s, materials] = await Promise.all([getSettings(), db.printMaterial.findMany({ orderBy: { sortOrder: "asc" } })]);

  const jump = [
    ["landing", "Home page"],
    ["stats", "Numbers"],
    ["rewards", "Rewards"],
    ["shipping", "Shipping"],
    ["print", "3D print pricing"],
    ["materials", "Materials"],
  ];

  return (
    <div className="max-w-[960px]">
      <PageHead eyebrow="Settings" title="Site settings" sub="Home page wording and the rules behind rewards, shipping and 3D printing." />
      <Flash sp={sp} />
      <nav className="mb-8 flex flex-wrap gap-2" aria-label="Sections">
        {jump.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full border border-line-2 px-3.5 py-1.5 text-sm text-fg-2 transition-colors hover:border-fg hover:text-fg">
            {label}
          </a>
        ))}
      </nav>

      <div className="space-y-8">
        <SettingsForm section="landing" back={BACK} title="Home page" sub="The big heading and the line under it at the top of the home page. “Robotics” turns into gears.">
          <F label="Main heading" name="headline"><input id="headline" name="headline" defaultValue={s.landing.headline} className="input" /></F>
          <F label="Sub-heading" name="sub"><textarea id="sub" name="sub" rows={3} defaultValue={s.landing.sub} className="input" /></F>
          <F label="Service area note" name="serviceArea"><input id="serviceArea" name="serviceArea" defaultValue={s.landing.serviceArea} className="input" /></F>
        </SettingsForm>

        <SettingsForm section="stats" back={BACK} title="Numbers" sub="The three counters on the home page. Only publish numbers you can stand behind.">
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid grid-cols-[110px_90px_1fr] gap-3">
              <F label="Number" name={`value${i}`}><input id={`value${i}`} name={`value${i}`} type="number" defaultValue={s.stats[i]?.value ?? ""} className="input font-mono" /></F>
              <F label="Suffix" name={`suffix${i}`}><input id={`suffix${i}`} name={`suffix${i}`} defaultValue={s.stats[i]?.suffix ?? ""} className="input font-mono" /></F>
              <F label="Label" name={`label${i}`}><input id={`label${i}`} name={`label${i}`} defaultValue={s.stats[i]?.label ?? ""} className="input" /></F>
            </div>
          ))}
        </SettingsForm>

        <SettingsForm section="rewards" back={BACK} title="Rewards" sub="One point is always worth ₹1.">
          <div className="grid gap-5 sm:grid-cols-3">
            <F label="Signup bonus (points)" name="signupBonus"><input id="signupBonus" name="signupBonus" type="number" min={0} defaultValue={s.rewards.signupBonus} className="input font-mono" /></F>
            <F label="Points per ₹100 paid" name="pointsPer100"><input id="pointsPer100" name="pointsPer100" type="number" min={0} defaultValue={s.rewards.pointsPer100} className="input font-mono" /></F>
            <F label="Max % of order payable" name="maxRedeemPct"><input id="maxRedeemPct" name="maxRedeemPct" type="number" min={0} max={100} defaultValue={s.rewards.maxRedeemPct} className="input font-mono" /></F>
          </div>
        </SettingsForm>

        <SettingsForm section="shipping" back={BACK} title="Shipping">
          <div className="grid gap-5 sm:grid-cols-2">
            <F label="Free shipping above (₹)" name="freeAbove"><input id="freeAbove" name="freeAbove" inputMode="decimal" defaultValue={rupeesValue(s.shipping.freeAbove)} className="input font-mono" /></F>
            <F label="Flat shipping fee (₹)" name="flat"><input id="flat" name="flat" inputMode="decimal" defaultValue={rupeesValue(s.shipping.flat)} className="input font-mono" /></F>
          </div>
        </SettingsForm>

        <SettingsForm section="print" back={BACK} title="3D print pricing" sub="Price = grams × material rate + print hours × machine rate + setup fee, with a minimum.">
          <div className="grid gap-5 sm:grid-cols-3">
            <F label="Setup fee per job (₹)" name="setupFee"><input id="setupFee" name="setupFee" inputMode="decimal" defaultValue={rupeesValue(s.print.setupFee)} className="input font-mono" /></F>
            <F label="Machine rate per hour (₹)" name="machineRate"><input id="machineRate" name="machineRate" inputMode="decimal" defaultValue={rupeesValue(s.print.machineRate)} className="input font-mono" /></F>
            <F label="Minimum job (₹)" name="minOrder"><input id="minOrder" name="minOrder" inputMode="decimal" defaultValue={rupeesValue(s.print.minOrder)} className="input font-mono" /></F>
            <F label="Bed X (mm)" name="bedX"><input id="bedX" name="bedX" type="number" defaultValue={s.print.bed.x} className="input font-mono" /></F>
            <F label="Bed Y (mm)" name="bedY"><input id="bedY" name="bedY" type="number" defaultValue={s.print.bed.y} className="input font-mono" /></F>
            <F label="Bed Z (mm)" name="bedZ"><input id="bedZ" name="bedZ" type="number" defaultValue={s.print.bed.z} className="input font-mono" /></F>
          </div>
          <F label="Turnaround text" name="turnaround"><input id="turnaround" name="turnaround" defaultValue={s.print.turnaround} className="input" /></F>
        </SettingsForm>

        <Card id="materials" title="Print materials" sub="Density is in g/cm³. Colours are comma-separated.">
          {[...materials, null].map((m, i) => (
            <form key={m?.id ?? "new"} action={saveMaterial} className="grid gap-3 rounded-[18px] bg-ink-2 p-4 sm:grid-cols-[100px_1fr_100px_110px]">
              {m && <input type="hidden" name="id" value={m.id} />}
              <F label="Code" name={`code-${i}`}><input id={`code-${i}`} name="code" required defaultValue={m?.code ?? ""} className="input h-11 font-mono" /></F>
              <F label="Name" name={`name-${i}`}><input id={`name-${i}`} name="name" required defaultValue={m?.name ?? ""} className="input h-11" /></F>
              <F label="Density" name={`density-${i}`}><input id={`density-${i}`} name="density" inputMode="decimal" defaultValue={m?.density ?? ""} className="input h-11 font-mono" /></F>
              <F label="₹ per gram" name={`ppg-${i}`}><input id={`ppg-${i}`} name="pricePerG" inputMode="decimal" defaultValue={m ? rupeesValue(m.pricePerG) : ""} className="input h-11 font-mono" /></F>
              <F label="Description" name={`desc-${i}`} className="sm:col-span-2"><input id={`desc-${i}`} name="description" defaultValue={m?.description ?? ""} className="input h-11" /></F>
              <F label="Colours" name={`colors-${i}`} className="sm:col-span-2"><input id={`colors-${i}`} name="colors" defaultValue={parseJSON<string[]>(m?.colors, []).join(", ")} className="input h-11" /></F>
              <div className="flex flex-wrap items-center gap-4 sm:col-span-4">
                <Check name="active" label="Offered" defaultChecked={m?.active ?? true} />
                <label className="flex items-center gap-2 text-sm">
                  Order <input name="sortOrder" type="number" defaultValue={m?.sortOrder ?? materials.length + 1} className="input h-10 w-20 font-mono" />
                </label>
                <SubmitButton className="ml-auto">{m ? "Save" : "Add material"}</SubmitButton>
              </div>
            </form>
          ))}
        </Card>
      </div>
    </div>
  );
}
