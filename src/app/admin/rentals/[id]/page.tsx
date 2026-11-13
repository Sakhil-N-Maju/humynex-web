import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { db, parseJSON } from "@/lib/db";
import { saveRental, deleteRental } from "../../actions";
import { F, Check, ImageInput, SubmitButton, ConfirmButton, rupeesValue } from "@/components/admin/ui";

export default async function EditRental({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = id === "new" ? null : await db.rentalItem.findUnique({ where: { id } });
  if (id !== "new" && !r) notFound();

  return (
    <div className="max-w-[900px]">
      <Link href="/admin/rentals" className="inline-flex items-center gap-2 text-sm text-fg-2 hover:text-volt-hi"><ArrowLeft size={14} /> Rental fleet</Link>
      <h1 className="display mt-3 text-3xl">{r ? r.name : "New rental item"}</h1>

      <form action={saveRental} className="mt-8 space-y-8">
        {r && <input type="hidden" name="id" value={r.id} />}
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
          <F label="Day rate (₹)" name="dailyRate"><input id="dailyRate" name="dailyRate" inputMode="decimal" required defaultValue={rupeesValue(r?.dailyRate)} className="input font-mono" /></F>
          <F label="Refundable deposit (₹)" name="deposit"><input id="deposit" name="deposit" inputMode="decimal" defaultValue={rupeesValue(r?.deposit)} className="input font-mono" /></F>
          <F label="Minimum days" name="minDays"><input id="minDays" name="minDays" type="number" min={1} defaultValue={r?.minDays ?? 1} className="input font-mono" /></F>
          <F label="Sort order" name="sortOrder" hint="Lower numbers show first."><input id="sortOrder" name="sortOrder" type="number" defaultValue={r?.sortOrder ?? 0} className="input font-mono" /></F>
          <F label="URL slug" name="slug" hint="Leave blank to generate from the name." className="sm:col-span-2"><input id="slug" name="slug" defaultValue={r?.slug ?? ""} className="input font-mono" /></F>
        </div>
        <F label="Tagline" name="tagline"><input id="tagline" name="tagline" defaultValue={r?.tagline} className="input" /></F>
        <F label="Description" name="description" hint="Separate paragraphs with a blank line."><textarea id="description" name="description" rows={5} defaultValue={r?.description} className="input" /></F>
        <div className="grid gap-5 sm:grid-cols-2">
          <F label="What's included" name="includes" hint="One per line."><textarea id="includes" name="includes" rows={5} defaultValue={parseJSON<string[]>(r?.includes, []).join("\n")} className="input" /></F>
          <F label="Popular for" name="goodFor" hint="One per line."><textarea id="goodFor" name="goodFor" rows={5} defaultValue={parseJSON<string[]>(r?.goodFor, []).join("\n")} className="input" /></F>
        </div>
        <ImageInput current={r?.image} />
        <div className="flex flex-wrap gap-6">
          <Check name="active" label="Bookable on the site" defaultChecked={r?.active ?? true} />
          <Check name="featured" label="Featured" defaultChecked={r?.featured ?? false} />
        </div>
        <div className="flex items-center gap-3 border-t border-line pt-6">
          <SubmitButton>{r ? "Save changes" : "Create item"}</SubmitButton>
          <Link href="/admin/rentals" className="btn btn-sm text-fg-2 hover:text-fg">Cancel</Link>
        </div>
      </form>
      {r && (
        <form action={deleteRental} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="id" value={r.id} />
          <ConfirmButton message={`Delete ${r.name}? If it has bookings it will be hidden instead.`}>Delete item</ConfirmButton>
        </form>
      )}
    </div>
  );
}
