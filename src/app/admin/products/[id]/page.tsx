import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { db, parseJSON } from "@/lib/db";
import { saveProduct, deleteProduct } from "../../actions";
import { F, Check, ImageInput, SubmitButton, ConfirmButton, rupeesValue } from "@/components/admin/ui";

const CATEGORIES = ["Microcontrollers", "Motors & Actuators", "Drivers & Power", "Sensors & Vision", "Kits", "Accessories"];

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = id === "new" ? null : await db.product.findUnique({ where: { id } });
  if (id !== "new" && !p) notFound();
  const existingCats = await db.product.groupBy({ by: ["category"] });
  const cats = Array.from(new Set([...CATEGORIES, ...existingCats.map((c) => c.category)]));
  const specText = parseJSON<{ label: string; value: string }[]>(p?.specs, []).map((s) => `${s.label}: ${s.value}`).join("\n");

  return (
    <div className="max-w-[900px]">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm text-fg-2 hover:text-volt-hi"><ArrowLeft size={14} /> Products</Link>
      <h1 className="display mt-3 text-3xl">{p ? p.name : "New product"}</h1>
      {p && <Link href={`/shop/${p.slug}`} target="_blank" className="text-sm text-volt-hi hover:underline">View on site</Link>}

      <form action={saveProduct} className="mt-8 space-y-8">
        {p && <input type="hidden" name="id" value={p.id} />}
        <div className="grid gap-5 sm:grid-cols-2">
          <F label="Name" name="name" className="sm:col-span-2"><input id="name" name="name" required defaultValue={p?.name} className="input" /></F>
          <F label="Category" name="category">
            <input id="category" name="category" list="cats" defaultValue={p?.category ?? CATEGORIES[0]} className="input" />
            <datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
          </F>
          <F label="Brand (optional)" name="brand"><input id="brand" name="brand" defaultValue={p?.brand ?? ""} className="input" /></F>
          <F label="Price (₹, incl. GST)" name="price"><input id="price" name="price" inputMode="decimal" required defaultValue={rupeesValue(p?.price)} className="input font-mono" /></F>
          <F label="Compare-at price (₹, optional)" name="compareAt" hint="Shown struck through when higher than the price."><input id="compareAt" name="compareAt" inputMode="decimal" defaultValue={rupeesValue(p?.compareAt)} className="input font-mono" /></F>
          <F label="Stock" name="stock"><input id="stock" name="stock" type="number" min={0} defaultValue={p?.stock ?? 0} className="input font-mono" /></F>
          <F label="SKU (optional)" name="sku"><input id="sku" name="sku" defaultValue={p?.sku ?? ""} className="input font-mono" /></F>
          <F label="URL slug" name="slug" hint="Leave blank to generate from the name." className="sm:col-span-2"><input id="slug" name="slug" defaultValue={p?.slug ?? ""} className="input font-mono" /></F>
        </div>

        <F label="Short summary" name="summary" hint="One sentence. Shown on product cards and search results."><textarea id="summary" name="summary" rows={2} defaultValue={p?.summary} className="input" /></F>
        <F label="Description" name="description" hint="Separate paragraphs with a blank line."><textarea id="description" name="description" rows={6} defaultValue={p?.description} className="input" /></F>
        <F label="Specifications" name="specs" hint="One per line, as Label: Value"><textarea id="specs" name="specs" rows={6} defaultValue={specText} className="input font-mono text-sm" /></F>

        <ImageInput current={p?.image} />

        <div className="flex flex-wrap gap-6">
          <Check name="active" label="Visible in the shop" defaultChecked={p?.active ?? true} />
          <Check name="featured" label="Feature on the home page" defaultChecked={p?.featured ?? false} />
        </div>

        <div className="flex items-center gap-3 border-t border-line pt-6">
          <SubmitButton>{p ? "Save changes" : "Create product"}</SubmitButton>
          <Link href="/admin/products" className="btn btn-sm text-fg-2 hover:text-fg">Cancel</Link>
        </div>
      </form>

      {p && (
        <form action={deleteProduct} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="id" value={p.id} />
          <ConfirmButton message={`Delete ${p.name}? If it appears in past orders it will be hidden instead.`}>Delete product</ConfirmButton>
        </form>
      )}
    </div>
  );
}
