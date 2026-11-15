import { notFound } from "next/navigation";
import { db, parseJSON } from "@/lib/db";
import { saveRental, deleteRental } from "../../actions";
import { F, Check, ImageInput, Card, EditHead, FormActions, DangerZone, rupeesValue } from "@/components/admin/ui";

export default async function EditRental({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = id === "new" ? null : await db.rentalItem.findUnique({ where: { id } });
  if (id !== "new" && !r) notFound();

  return (
    <div className="max-w-[960px]">
      <EditHead backHref="/admin/rentals" backLabel="Rentals" title={r ? r.name : "New rental"} viewHref={r ? `/rentals/${r.slug}` : undefined} />

      <form action={saveRental} className="space-y-6">
        {r && <input type="hidden" name="id" value={r.id} />}

        <Card title="Basics">
          <div className="grid gap-5 sm:grid-cols-2">
            <F label="Name" name="name" className="sm:col-span-2"><input id="name" name="name" required defaultValue={r?.name} className="input" /></F>
            <F label="Type" name="kind">
              <select id="kind" name="kind" defaultValue={r?.kind ?? "ROBOT"} className="input">
                <option value="ROBOT">Robot</option>
                <option value="COSTUME">Costume</option>
                <option value="FLEET">Fleet / package</option>
              </select>
            </F>
            <F label="Units available" name="units" hint="How many can be out on the same day."><input id="units" name="units" type="number" min={1} defaultValue={r?.units ?? 1} className="input font-mono" /></F>
            <F label="Sort order" name="sortOrder" hint="Lower numbers show first."><input id="sortOrder" name="sortOrder" type="number" defaultValue={r?.sortOrder ?? 0} className="input font-mono" /></F>
            <F label="URL slug" name="slug" hint="Leave blank to make one from the name."><input id="slug" name="slug" defaultValue={r?.slug ?? ""} className="input font-mono" /></F>
          </div>
        </Card>

        <Card title="Pricing">
          <div className="grid gap-5 sm:grid-cols-3">
            <F label="Day rate (₹)" name="dailyRate"><input id="dailyRate" name="dailyRate" inputMode="decimal" required defaultValue={rupeesValue(r?.dailyRate)} className="input font-mono" /></F>
            <F label="Refundable deposit (₹)" name="deposit"><input id="deposit" name="deposit" inputMode="decimal" defaultValue={rupeesValue(r?.deposit)} className="input font-mono" /></F>
            <F label="Minimum days" name="minDays"><input id="minDays" name="minDays" type="number" min={1} defaultValue={r?.minDays ?? 1} className="input font-mono" /></F>
          </div>
        </Card>

        <Card title="Description">
          <F label="Short line" name="tagline" hint="One sentence under the name."><input id="tagline" name="tagline" defaultValue={r?.tagline} className="input" /></F>
          <F label="Full description" name="description" hint="Separate paragraphs with a blank line."><textarea id="description" name="description" rows={5} defaultValue={r?.description} className="input" /></F>
          <div className="grid gap-5 sm:grid-cols-2">
            <F label="What's included" name="includes" hint="One per line."><textarea id="includes" name="includes" rows={5} defaultValue={parseJSON<string[]>(r?.includes, []).join("\n")} className="input" /></F>
            <F label="Popular for" name="goodFor" hint="One per line. The first three show as tags."><textarea id="goodFor" name="goodFor" rows={5} defaultValue={parseJSON<string[]>(r?.goodFor, []).join("\n")} className="input" /></F>
          </div>
        </Card>

        <Card title="Photo" sub="Used where there's no 3D model, and when the link is shared.">
          <ImageInput current={r?.image} label="Rental photo" />
        </Card>

        <Card title="Visibility">
          <div className="flex flex-wrap gap-3">
            <Check name="active" label="Shown on the site" defaultChecked={r?.active ?? true} />
            <Check name="featured" label="Featured" defaultChecked={r?.featured ?? false} />
          </div>
        </Card>

        <FormActions saveLabel={r ? "Save changes" : "Add rental"} cancelHref="/admin/rentals" />
      </form>

      {r && (
        <DangerZone
          action={deleteRental}
          id={r.id}
          label="Delete rental"
          message={`Delete ${r.name}? If it has bookings it will be hidden instead.`}
          note="Deleting removes it from the Rentals page. Rentals with past bookings are hidden instead, so booking history stays intact."
        />
      )}
    </div>
  );
}
