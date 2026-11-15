import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { db, parseJSON } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { updatePrintJob } from "../../actions";
import { Flash, Status, SubmitButton, rupeesValue } from "@/components/admin/ui";

const STATUSES = ["QUOTED", "PENDING_PAYMENT", "PAID", "PRINTING", "READY", "SHIPPED", "CANCELLED"];

export default async function AdminPrint({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const j = await db.printJob.findUnique({ where: { id } });
  if (!j) notFound();
  const b = parseJSON<Record<string, number | boolean | string | null>>(j.breakdown, {});

  return (
    <div className="max-w-[1000px]">
      <Link href="/admin/prints" className="inline-flex items-center gap-2 text-sm text-fg-2 hover:text-volt-hi"><ArrowLeft size={14} /> Print jobs</Link>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <h1 className="display font-mono text-3xl">{j.number}</h1>
        <Status value={j.status} />
      </div>
      <div className="mt-6"><Flash sp={sp} /></div>
      {j.needsReview && (
        <p className="mt-4 rounded-[18px] border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          Needs a manual quote: the part is outside the bed or suspiciously small (possibly wrong units). Set a price and move it to &ldquo;pending payment&rdquo;, and the customer can pay from their account.
        </p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <section className="surface space-y-3 p-5 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="truncate font-medium">{j.fileName}</span>
            <a href={`/api/admin/print-file/${j.id}`} className="btn btn-ghost btn-sm shrink-0"><DownloadSimple size={16} /> Download</a>
          </div>
          <dl className="grid grid-cols-2 gap-y-2">
            <dt className="text-fg-3">Size</dt><dd className="font-mono">{j.sizeX} x {j.sizeY} x {j.sizeZ} mm</dd>
            <dt className="text-fg-3">Volume</dt><dd className="font-mono">{j.volumeCm3} cm³</dd>
            <dt className="text-fg-3">File units</dt><dd>{j.units}</dd>
            <dt className="text-fg-3">Material</dt><dd>{j.material}, {j.color}</dd>
            <dt className="text-fg-3">Infill / finish</dt><dd>{j.infill}%, {j.quality.toLowerCase()}</dd>
            <dt className="text-fg-3">Quantity</dt><dd className="font-mono">{j.quantity}</dd>
            <dt className="text-fg-3">Estimate</dt><dd className="font-mono">{j.grams} g, {j.hours} h each</dd>
            <dt className="text-fg-3">Price</dt><dd className="font-mono">{formatINR(j.estimate)}{b.coupon ? ` (${b.coupon})` : ""}</dd>
          </dl>
          {j.notes && <p className="border-t border-line pt-3 text-fg-2">&ldquo;{j.notes}&rdquo;</p>}
        </section>
        <section className="space-y-6">
          <div className="surface p-5 text-sm">
            <h2 className="font-semibold">Customer</h2>
            <p className="mt-2">{j.name}</p>
            <p><a href={`tel:${j.phone}`} className="text-volt-hi">{j.phone}</a><br /><a href={`mailto:${j.email}`} className="text-volt-hi">{j.email}</a></p>
          </div>
          <form action={updatePrintJob} className="surface space-y-4 p-5">
            <input type="hidden" name="id" value={j.id} />
            <div>
              <label htmlFor="status" className="field-label">Status</label>
              <select id="status" name="status" defaultValue={j.status} className="input h-10">
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="estimate" className="field-label">Set price (₹, optional)</label>
              <input id="estimate" name="estimate" inputMode="decimal" placeholder={rupeesValue(j.estimate)} className="input h-10 font-mono" />
              <p className="mt-1.5 text-xs text-fg-3">Leave blank to keep {formatINR(j.estimate)}.</p>
            </div>
            <SubmitButton>Update job</SubmitButton>
          </form>
        </section>
      </div>
    </div>
  );
}
