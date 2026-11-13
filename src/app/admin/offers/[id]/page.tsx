import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { saveCoupon, deleteCoupon } from "../../actions";
import { F, Check, SubmitButton, ConfirmButton, rupeesValue } from "@/components/admin/ui";

const d = (x: Date | null | undefined) => (x ? x.toISOString().slice(0, 10) : "");

export default async function EditOffer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = id === "new" ? null : await db.coupon.findUnique({ where: { id } });
  if (id !== "new" && !c) notFound();

  return (
    <div className="max-w-[760px]">
      <Link href="/admin/offers" className="inline-flex items-center gap-2 text-sm text-fg-2 hover:text-volt-hi"><ArrowLeft size={14} /> Offers</Link>
      <h1 className="display mt-3 text-3xl">{c ? c.code : "New offer"}</h1>
      <form action={saveCoupon} className="mt-8 space-y-6">
        {c && <input type="hidden" name="id" value={c.id} />}
        <div className="grid gap-5 sm:grid-cols-2">
          <F label="Code" name="code" hint="Letters and numbers only. Customers type this at checkout."><input id="code" name="code" required defaultValue={c?.code} className="input font-mono uppercase" /></F>
          <F label="Applies to" name="appliesTo">
            <select id="appliesTo" name="appliesTo" defaultValue={c?.appliesTo ?? "ALL"} className="input">
              <option value="ALL">Everything</option>
              <option value="SHOP">Parts orders</option>
              <option value="RENTAL">Rentals (rent only, not deposit)</option>
              <option value="PRINT">3D printing</option>
            </select>
          </F>
          <F label="Title" name="title" className="sm:col-span-2"><input id="title" name="title" required defaultValue={c?.title} className="input" /></F>
          <F label="Description" name="description" className="sm:col-span-2"><input id="description" name="description" defaultValue={c?.description} className="input" /></F>
          <F label="Discount type" name="type">
            <select id="type" name="type" defaultValue={c?.type ?? "PERCENT"} className="input">
              <option value="PERCENT">Percent off</option>
              <option value="FLAT">Fixed amount off (₹)</option>
            </select>
          </F>
          <F label="Value" name="value" hint="Percent (1 to 100), or rupees for a fixed amount."><input id="value" name="value" inputMode="decimal" required defaultValue={c ? (c.type === "FLAT" ? rupeesValue(c.value) : String(c.value)) : ""} className="input font-mono" /></F>
          <F label="Minimum order (₹)" name="minOrder"><input id="minOrder" name="minOrder" inputMode="decimal" defaultValue={rupeesValue(c?.minOrder ?? 0)} className="input font-mono" /></F>
          <F label="Maximum discount (₹, optional)" name="maxDiscount" hint="Caps percent offers."><input id="maxDiscount" name="maxDiscount" inputMode="decimal" defaultValue={rupeesValue(c?.maxDiscount)} className="input font-mono" /></F>
          <F label="Starts (optional)" name="startsAt"><input id="startsAt" name="startsAt" type="date" defaultValue={d(c?.startsAt)} className="input" /></F>
          <F label="Ends (optional)" name="endsAt"><input id="endsAt" name="endsAt" type="date" defaultValue={d(c?.endsAt)} className="input" /></F>
          <F label="Total uses allowed (optional)" name="usageLimit"><input id="usageLimit" name="usageLimit" type="number" min={1} defaultValue={c?.usageLimit ?? ""} className="input font-mono" /></F>
        </div>
        <div className="flex flex-wrap gap-6">
          <Check name="active" label="Active" defaultChecked={c?.active ?? true} />
          <Check name="showOnSite" label="Show on the Offers page" defaultChecked={c?.showOnSite ?? true} />
          <Check name="membersOnly" label="Signed-in members only" defaultChecked={c?.membersOnly ?? false} />
        </div>
        <div className="flex items-center gap-3 border-t border-line pt-6">
          <SubmitButton>{c ? "Save offer" : "Create offer"}</SubmitButton>
          <Link href="/admin/offers" className="btn btn-sm text-fg-2 hover:text-fg">Cancel</Link>
        </div>
      </form>
      {c && (
        <form action={deleteCoupon} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="id" value={c.id} />
          <ConfirmButton message={`Delete code ${c.code}? Turning it off keeps the history instead.`}>Delete offer</ConfirmButton>
        </form>
      )}
    </div>
  );
}
