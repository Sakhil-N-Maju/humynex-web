import { notFound } from "next/navigation";
import { db, parseJSON } from "@/lib/db";
import { saveProduct, deleteProduct } from "../../actions";
import { F, Check, ImageInput, Card, EditHead, FormActions, DangerZone, rupeesValue } from "@/components/admin/ui";

const CATEGORIES = ["Microcontrollers", "Motors & Actuators", "Drivers & Power", "Sensors & Vision", "Kits", "Accessories"];

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = id === "new" ? null : await db.product.findUnique({ where: { id } });
  if (id !== "new" && !p) notFound();
  const existingCats = await db.product.groupBy({ by: ["category"] });
  const cats = Array.from(new Set([...CATEGORIES, ...existingCats.map((c) => c.category)]));
  const specText = parseJSON<{ label: string; value: string }[]>(p?.specs, []).map((s) => `${s.label}: ${s.value}`).join("\n");

  return (
    <div className="max-w-[960px]">
      <EditHead backHref="/admin/products" backLabel="Shop parts" title={p ? p.name : "New part"} viewHref={p ? `/shop/${p.slug}` : undefined} />

      <form action={saveProduct} className="space-y-6">
        {p && <input type="hidden" name="id" value={p.id} />}

        <Card title="Basics">
          <div className="grid gap-5 sm:grid-cols-2">
            <F label="Name" name="name" className="sm:col-span-2"><input id="name" name="name" required defaultValue={p?.name} className="input" /></F>
            <F label="Category" name="category">
              <input id="category" name="category" list="cats" defaultValue={p?.category ?? CATEGORIES[0]} className="input" />
              <datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
            </F>
            <F label="Brand (optional)" name="brand"><input id="brand" name="brand" defaultValue={p?.brand ?? ""} className="input" /></F>
            <F label="SKU (optional)" name="sku"><input id="sku" name="sku" defaultValue={p?.sku ?? ""} className="input font-mono" /></F>
            <F label="URL slug" name="slug" hint="Leave blank to make one from the name."><input id="slug" name="slug" defaultValue={p?.slug ?? ""} className="input font-mono" /></F>
          </div>
        </Card>

        <Card title="Price and stock">
          <div className="grid gap-5 sm:grid-cols-3">
            <F label="Price (₹, incl. GST)" name="price"><input id="price" name="price" inputMode="decimal" required defaultValue={rupeesValue(p?.price)} className="input font-mono" /></F>
            <F label="Was price (₹, optional)" name="compareAt" hint="Shown struck through when higher."><input id="compareAt" name="compareAt" inputMode="decimal" defaultValue={rupeesValue(p?.compareAt)} className="input font-mono" /></F>
            <F label="In stock" name="stock"><input id="stock" name="stock" type="number" min={0} defaultValue={p?.stock ?? 0} className="input font-mono" /></F>
          </div>
        </Card>

        <Card title="Description">
          <F label="Short summary" name="summary" hint="One sentence. Shown on product cards."><textarea id="summary" name="summary" rows={2} defaultValue={p?.summary} className="input" /></F>
          <F label="Full description" name="description" hint="Separate paragraphs with a blank line."><textarea id="description" name="description" rows={6} defaultValue={p?.description} className="input" /></F>
          <F label="Specifications" name="specs" hint="One per line, as Label: Value"><textarea id="specs" name="specs" rows={6} defaultValue={specText} className="input font-mono text-sm" /></F>
        </Card>

        <Card title="Photo">
          <ImageInput current={p?.image} label="Product photo" />
        </Card>

        <Card title="Visibility">
          <div className="flex flex-wrap gap-3">
            <Check name="active" label="Visible in the shop" defaultChecked={p?.active ?? true} />
            <Check name="featured" label="Featured" defaultChecked={p?.featured ?? false} />
          </div>
        </Card>

        <FormActions saveLabel={p ? "Save changes" : "Add part"} cancelHref="/admin/products" />
      </form>

      {p && (
        <DangerZone
          action={deleteProduct}
          id={p.id}
          label="Delete part"
          message={`Delete ${p.name}? If it appears in past orders it will be hidden instead.`}
          note="Deleting removes it from the shop. Parts that appear in past orders are hidden instead, so order history stays intact."
        />
      )}
    </div>
  );
}
