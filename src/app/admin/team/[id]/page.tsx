import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { saveTeam, deleteTeam } from "../../actions";
import { F, Check, ImageInput, Card, EditHead, FormActions, DangerZone } from "@/components/admin/ui";

export default async function EditTeam({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = id === "new" ? null : await db.teamMember.findUnique({ where: { id } });
  if (id !== "new" && !m) notFound();

  return (
    <div className="max-w-[860px]">
      <EditHead backHref="/admin/about" backLabel="About page" title={m ? (m.isPlaceholder ? m.role : m.name) : "Add a team member"} />

      <form action={saveTeam} className="space-y-6">
        {m && <input type="hidden" name="id" value={m.id} />}

        <Card title="Profile">
          <div className="grid gap-5 sm:grid-cols-2">
            <F label="Full name" name="name"><input id="name" name="name" required defaultValue={m?.isPlaceholder ? "" : m?.name} className="input" /></F>
            <F label="Role" name="role"><input id="role" name="role" required defaultValue={m?.role} className="input" /></F>
            <F label="LinkedIn URL (optional)" name="linkedin"><input id="linkedin" name="linkedin" type="url" defaultValue={m?.linkedin ?? ""} className="input" /></F>
            <F label="Sort order" name="sortOrder" hint="Lower numbers show first."><input id="sortOrder" name="sortOrder" type="number" defaultValue={m?.sortOrder ?? 0} className="input font-mono" /></F>
          </div>
          <F label="Short bio" name="bio" hint="One or two sentences about what they do."><textarea id="bio" name="bio" rows={3} defaultValue={m?.bio} className="input" /></F>
        </Card>

        <Card title="Photo">
          <ImageInput current={m?.photo} label="Photo" />
        </Card>

        <Card title="Visibility">
          <div className="flex flex-wrap gap-3">
            <Check name="active" label="Show on the About page" defaultChecked={m?.active ?? true} />
            <Check name="isPlaceholder" label="This is a placeholder" defaultChecked={false} />
          </div>
        </Card>

        <FormActions saveLabel={m ? "Save profile" : "Add person"} cancelHref="/admin/about" />
      </form>

      {m && (
        <DangerZone
          action={deleteTeam}
          id={m.id}
          label="Remove person"
          message="Remove this person from the team?"
          note="Removes them from the About page for good. To hide them for now, untick Show on the About page."
        />
      )}
    </div>
  );
}
