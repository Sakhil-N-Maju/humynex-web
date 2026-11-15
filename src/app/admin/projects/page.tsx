import Link from "next/link";
import { db } from "@/lib/db";
import { PageHead, Flash, Table, LiveTag, Thumb } from "@/components/admin/ui";

export default async function AdminProjects({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const projects = await db.project.findMany({ orderBy: [{ sortOrder: "asc" }] });
  return (
    <div className="max-w-[1200px]">
      <PageHead
        eyebrow="Website · Projects"
        title="Projects"
        sub="Builds shown on the Projects page and in “Our works” on the home page."
        action={{ href: "/admin/projects/new", label: "Add project" }}
      />
      <Flash sp={sp} />
      <Table head={["Project", "Tag", "Stage", "Year", "Status"]}>
        {projects.map((p) => (
          <tr key={p.id}>
            <td>
              <Link href={`/admin/projects/${p.id}`} className="flex items-center gap-3 font-medium hover:text-[#1E90FF]">
                <Thumb src={p.cover} />
                {p.title}
              </Link>
            </td>
            <td className="text-fg-2">{p.tag}</td>
            <td className="text-fg-2">{p.status}</td>
            <td className="font-mono">{p.year}</td>
            <td>
              <span className="flex flex-wrap gap-1.5">
                <LiveTag live={p.published} liveLabel="Published" hiddenLabel="Draft" />
                {p.featured && <span className="rounded-full bg-[#1E90FF]/10 px-2.5 py-1 text-xs font-medium text-[#1E90FF]">Lead</span>}
              </span>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
