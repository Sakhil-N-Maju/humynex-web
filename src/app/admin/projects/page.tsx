import Link from "next/link";
import { db } from "@/lib/db";
import { PageHead, Flash, Table } from "@/components/admin/ui";

export default async function AdminProjects({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const projects = await db.project.findMany({ orderBy: [{ sortOrder: "asc" }] });
  return (
    <div className="max-w-[1200px]">
      <PageHead title="Projects" sub="Case studies shown on the Projects page and home page." action={{ href: "/admin/projects/new", label: "Add project" }} />
      <Flash sp={sp} />
      <Table head={["Project", "Tag", "Status", "Year", "Visibility"]}>
        {projects.map((p) => (
          <tr key={p.id} className="hover:bg-ink-2">
            <td className="px-4 py-3"><Link href={`/admin/projects/${p.id}`} className="font-medium hover:text-volt-hi">{p.title}</Link></td>
            <td className="px-4 py-3 text-fg-2">{p.tag}</td>
            <td className="px-4 py-3 text-fg-2">{p.status}</td>
            <td className="px-4 py-3 font-mono">{p.year}</td>
            <td className="px-4 py-3 text-xs">
              {p.published ? <span className="text-ok">Published</span> : <span className="text-fg-3">Draft</span>}
              {p.featured && <span className="ml-2 text-volt-hi">Featured</span>}
              {!p.cover && <span className="ml-2 text-fg-3">No cover</span>}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
