import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { PageHead, Flash } from "@/components/admin/ui";

export default async function AdminTeam({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const team = await db.teamMember.findMany({ orderBy: { sortOrder: "asc" } });
  const placeholders = team.filter((m) => m.isPlaceholder).length;
  return (
    <div className="max-w-[1200px]">
      <PageHead title="Team" sub="Shown on the About page, in this order." action={{ href: "/admin/team/new", label: "Add person" }} />
      <Flash sp={sp} />
      {placeholders > 0 && (
        <p className="mb-6 rounded-[4px] border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          {placeholders} profiles are placeholders. The About page shows them as &ldquo;Profile coming soon&rdquo; until a real profile exists, then hides them automatically.
        </p>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m) => (
          <li key={m.id}>
            <Link href={`/admin/team/${m.id}`} className="flex items-center gap-4 rounded-[4px] border border-line p-4 hover:border-volt/60">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-ink-3">
                {m.photo && <Image src={m.photo} alt="" fill sizes="56px" className="object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{m.isPlaceholder ? <span className="text-fg-3">Placeholder</span> : m.name}</p>
                <p className="truncate text-sm text-fg-2">{m.role}</p>
                {!m.active && <p className="text-xs text-fg-3">Hidden</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
