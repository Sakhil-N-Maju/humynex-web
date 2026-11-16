import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Plus } from "@phosphor-icons/react/dist/ssr";
import { getSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { PageHead, Flash, F, Card, LiveTag } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminAbout({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [s, team] = await Promise.all([getSettings(), db.teamMember.findMany({ orderBy: { sortOrder: "asc" } })]);
  // always show six slots so a new principle can be added
  const pillars: { title: string; body: string }[] = [...s.pillars];
  while (pillars.length < 6) pillars.push({ title: "", body: "" });

  return (
    <div className="max-w-[960px] space-y-8">
      <PageHead eyebrow="Website · About" title="About page" sub="Everything on the About page, top to bottom." />
      <Flash sp={sp} />

      <SettingsForm
        section="mission"
        back="/admin/about"
        title="Vision and mission"
        sub="The vision is the big heading at the top of the About page. The words “objects” and “alongside” are highlighted in blue when present."
      >
        <F label="Vision headline" name="vision"><input id="vision" name="vision" defaultValue={s.mission.vision} className="input" /></F>
        <F label="Vision text" name="visionBody"><textarea id="visionBody" name="visionBody" rows={3} defaultValue={s.mission.visionBody} className="input" /></F>
        <F label="Mission headline" name="mission"><input id="mission" name="mission" defaultValue={s.mission.mission} className="input" /></F>
        <F label="Mission text" name="missionBody"><textarea id="missionBody" name="missionBody" rows={3} defaultValue={s.mission.missionBody} className="input" /></F>
        <F label="Pull quote" name="quote"><textarea id="quote" name="quote" rows={2} defaultValue={s.mission.quote} className="input" /></F>
      </SettingsForm>

      <SettingsForm
        section="pillars"
        back="/admin/about"
        title="Principles"
        sub="The numbered cards under “What we hold to”. Leave a title empty to remove that card. Up to six."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {pillars.slice(0, 6).map((p, i) => (
            <div key={i} className="space-y-3 rounded-[18px] bg-ink-2 p-4">
              <span className="grid size-8 place-items-center rounded-full bg-[#1E90FF] font-mono text-xs font-semibold text-white">
                {String(i + 1).padStart(2, "0")}
              </span>
              <F label="Title" name={`title${i}`}><input id={`title${i}`} name={`title${i}`} defaultValue={p.title} className="input" /></F>
              <F label="Description" name={`body${i}`}><textarea id={`body${i}`} name={`body${i}`} rows={3} defaultValue={p.body} className="input" /></F>
            </div>
          ))}
        </div>
      </SettingsForm>

      <Card title="Team" sub="The people grid. Placeholder cards hide automatically once a real profile is added.">
        <ul className="divide-y divide-line rounded-[18px] border border-line">
          {team.map((m) => (
            <li key={m.id}>
              <Link href={`/admin/team/${m.id}`} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-ink-2/60">
                <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-ink-3">
                  {m.photo && <Image src={m.photo} alt="" fill sizes="44px" className="object-cover" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{m.isPlaceholder ? `${m.role} (placeholder)` : m.name}</span>
                  <span className="block truncate text-sm text-fg-3">{m.role}</span>
                </span>
                <LiveTag live={m.active} liveLabel="Shown" />
                <ArrowUpRight size={16} className="text-fg-3" />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/admin/team/new" className="btn btn-primary btn-sm">
          <Plus size={14} weight="bold" /> Add team member
        </Link>
      </Card>
    </div>
  );
}
