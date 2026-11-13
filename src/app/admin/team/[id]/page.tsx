import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { saveTeam, deleteTeam } from "../../actions";
import { F, Check, ImageInput, SubmitButton, ConfirmButton } from "@/components/admin/ui";

export default async function EditTeam({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = id === "new" ? null : await db.teamMember.findUnique({ where: { id } });
  if (id !== "new" && !m) notFound();

  return (
    <div className="max-w-[760px]">
      <Link href="/admin/team" className="inline-flex items-center gap-2 text-sm text-fg-2 hover:text-volt-hi"><ArrowLeft size={14} /> Team</Link>
      <h1 className="display mt-3 text-3xl">{m ? (m.isPlaceholder ? m.role : m.name) : "Add a person"}</h1>
      <form action={saveTeam} className="mt-8 space-y-6">
        {m && <input type="hidden" name="id" value={m.id} />}
        <div className="grid gap-5 sm:grid-cols-2">
          <F label="Full name" name="name"><input id="name" name="name" required defaultValue={m?.isPlaceholder ? "" : m?.name} className="input" /></F>
          <F label="Role" name="role"><input id="role" name="role" required defaultValue={m?.role} className="input" /></F>
          <F label="LinkedIn URL (optional)" name="linkedin" className="sm:col-span-2"><input id="linkedin" name="linkedin" type="url" defaultValue={m?.linkedin ?? ""} className="input" /></F>
          <F label="Sort order" name="sortOrder"><input id="sortOrder" name="sortOrder" type="number" defaultValue={m?.sortOrder ?? 0} className="input font-mono" /></F>
        </div>
        <F label="Short bio" name="bio" hint="One or two sentences about what they do."><textarea id="bio" name="bio" rows={3} defaultValue={m?.bio} className="input" /></F>
        <ImageInput current={m?.photo} label="Photo" />
        <div className="flex flex-wrap gap-6">
          <Check name="active" label="Show on the About page" defaultChecked={m?.active ?? true} />
          <Check name="isPlaceholder" label="This is a placeholder" defaultChecked={false} />
        </div>
        <div className="flex items-center gap-3 border-t border-line pt-6">
          <SubmitButton>{m ? "Save profile" : "Add person"}</SubmitButton>
          <Link href="/admin/team" className="btn btn-sm text-fg-2 hover:text-fg">Cancel</Link>
        </div>
      </form>
      {m && (
        <form action={deleteTeam} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="id" value={m.id} />
          <ConfirmButton message="Remove this person from the team?">Remove</ConfirmButton>
        </form>
      )}
    </div>
  );
}
