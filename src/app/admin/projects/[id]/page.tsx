import { notFound } from "next/navigation";
import { db, parseJSON } from "@/lib/db";
import { saveProject, deleteProject } from "../../actions";
import { F, Check, ImageInput, Card, EditHead, FormActions, DangerZone } from "@/components/admin/ui";

const STATUSES = ["Delivered", "In development", "Active", "Prototype", "Early access", "Testing", "R&D"];

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = id === "new" ? null : await db.project.findUnique({ where: { id } });
  if (id !== "new" && !p) notFound();

  return (
    <div className="max-w-[960px]">
      <EditHead backHref="/admin/projects" backLabel="Projects" title={p ? p.title : "New project"} viewHref={p ? `/projects/${p.slug}` : undefined} />

      <form action={saveProject} className="space-y-6">
        {p && <input type="hidden" name="id" value={p.id} />}

        <Card title="Basics">
          <div className="grid gap-5 sm:grid-cols-2">
            <F label="Title" name="title" className="sm:col-span-2"><input id="title" name="title" required defaultValue={p?.title} className="input" /></F>
            <F label="Tag" name="tag" hint="e.g. Hardware, Software, Lab setup"><input id="tag" name="tag" defaultValue={p?.tag ?? "Hardware"} className="input" /></F>
            <F label="Stage" name="status">
              <input id="status" name="status" list="statuses" defaultValue={p?.status ?? "Delivered"} className="input" />
              <datalist id="statuses">{STATUSES.map((s) => <option key={s} value={s} />)}</datalist>
            </F>
            <F label="Year" name="year"><input id="year" name="year" type="number" defaultValue={p?.year ?? new Date().getFullYear()} className="input font-mono" /></F>
            <F label="Client (optional)" name="client"><input id="client" name="client" defaultValue={p?.client ?? ""} className="input" /></F>
            <F label="Sort order" name="sortOrder" hint="Lower numbers show first."><input id="sortOrder" name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 0} className="input font-mono" /></F>
            <F label="URL slug" name="slug" hint="Leave blank to make one from the title."><input id="slug" name="slug" defaultValue={p?.slug ?? ""} className="input font-mono" /></F>
          </div>
        </Card>

        <Card title="Story">
          <F label="Summary" name="summary" hint="One or two sentences."><textarea id="summary" name="summary" rows={2} defaultValue={p?.summary} className="input" /></F>
          <F label="Full story" name="body" hint="Separate paragraphs with a blank line."><textarea id="body" name="body" rows={8} defaultValue={p?.body} className="input" /></F>
          <div className="grid gap-5 sm:grid-cols-2">
            <F label="Outcomes" name="outcomes" hint="One per line."><textarea id="outcomes" name="outcomes" rows={4} defaultValue={parseJSON<string[]>(p?.outcomes, []).join("\n")} className="input" /></F>
            <F label="Built with" name="stack" hint="One per line."><textarea id="stack" name="stack" rows={4} defaultValue={parseJSON<string[]>(p?.stack, []).join("\n")} className="input" /></F>
          </div>
        </Card>

        <Card title="Cover image">
          <ImageInput current={p?.cover} label="Cover image" />
        </Card>

        <Card title="Visibility">
          <div className="flex flex-wrap gap-3">
            <Check name="published" label="Published" defaultChecked={p?.published ?? true} />
            <Check name="featured" label="Lead project on the Projects page" defaultChecked={p?.featured ?? false} />
          </div>
        </Card>

        <FormActions saveLabel={p ? "Save changes" : "Add project"} cancelHref="/admin/projects" />
      </form>

      {p && (
        <DangerZone
          action={deleteProject}
          id={p.id}
          label="Delete project"
          message={`Delete ${p.title}? This can't be undone.`}
          note="Deleting removes the project and its page for good. To take it down for now, untick Published instead."
        />
      )}
    </div>
  );
}
