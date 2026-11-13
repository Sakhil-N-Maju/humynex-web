import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { db, parseJSON } from "@/lib/db";
import { saveProject, deleteProject } from "../../actions";
import { F, Check, ImageInput, SubmitButton, ConfirmButton } from "@/components/admin/ui";

const STATUSES = ["Delivered", "In development", "Active", "Prototype", "Early access", "Testing", "R&D"];

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = id === "new" ? null : await db.project.findUnique({ where: { id } });
  if (id !== "new" && !p) notFound();

  return (
    <div className="max-w-[900px]">
      <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-fg-2 hover:text-volt-hi"><ArrowLeft size={14} /> Projects</Link>
      <h1 className="display mt-3 text-3xl">{p ? p.title : "New project"}</h1>
      <form action={saveProject} className="mt-8 space-y-8">
        {p && <input type="hidden" name="id" value={p.id} />}
        <div className="grid gap-5 sm:grid-cols-2">
          <F label="Title" name="title" className="sm:col-span-2"><input id="title" name="title" required defaultValue={p?.title} className="input" /></F>
          <F label="Tag" name="tag" hint="e.g. Hardware, Software, Lab setup"><input id="tag" name="tag" defaultValue={p?.tag ?? "Hardware"} className="input" /></F>
          <F label="Status" name="status">
            <input id="status" name="status" list="statuses" defaultValue={p?.status ?? "Delivered"} className="input" />
            <datalist id="statuses">{STATUSES.map((s) => <option key={s} value={s} />)}</datalist>
          </F>
          <F label="Year" name="year"><input id="year" name="year" type="number" defaultValue={p?.year ?? new Date().getFullYear()} className="input font-mono" /></F>
          <F label="Client (optional)" name="client"><input id="client" name="client" defaultValue={p?.client ?? ""} className="input" /></F>
          <F label="Sort order" name="sortOrder"><input id="sortOrder" name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 0} className="input font-mono" /></F>
          <F label="URL slug" name="slug" hint="Leave blank to generate from the title."><input id="slug" name="slug" defaultValue={p?.slug ?? ""} className="input font-mono" /></F>
        </div>
        <F label="Summary" name="summary" hint="One or two sentences."><textarea id="summary" name="summary" rows={2} defaultValue={p?.summary} className="input" /></F>
        <F label="Story" name="body" hint="Separate paragraphs with a blank line."><textarea id="body" name="body" rows={8} defaultValue={p?.body} className="input" /></F>
        <div className="grid gap-5 sm:grid-cols-2">
          <F label="Outcomes" name="outcomes" hint="One per line."><textarea id="outcomes" name="outcomes" rows={4} defaultValue={parseJSON<string[]>(p?.outcomes, []).join("\n")} className="input" /></F>
          <F label="Built with" name="stack" hint="One per line."><textarea id="stack" name="stack" rows={4} defaultValue={parseJSON<string[]>(p?.stack, []).join("\n")} className="input" /></F>
        </div>
        <ImageInput current={p?.cover} label="Cover image" />
        <div className="flex flex-wrap gap-6">
          <Check name="published" label="Published" defaultChecked={p?.published ?? true} />
          <Check name="featured" label="Lead project on the Projects page" defaultChecked={p?.featured ?? false} />
        </div>
        <div className="flex items-center gap-3 border-t border-line pt-6">
          <SubmitButton>{p ? "Save changes" : "Create project"}</SubmitButton>
          <Link href="/admin/projects" className="btn btn-sm text-fg-2 hover:text-fg">Cancel</Link>
        </div>
      </form>
      {p && (
        <form action={deleteProject} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="id" value={p.id} />
          <ConfirmButton message={`Delete ${p.title}? This can't be undone.`}>Delete project</ConfirmButton>
        </form>
      )}
    </div>
  );
}
