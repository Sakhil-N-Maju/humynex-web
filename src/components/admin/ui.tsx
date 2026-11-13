import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { SubmitButton, ConfirmButton } from "./client";

export { SubmitButton, ConfirmButton };

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-fg-2">{sub}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn btn-primary btn-sm">
          <Plus size={16} weight="bold" /> {action.label}
        </Link>
      )}
    </div>
  );
}

export function Flash({ sp }: { sp: Record<string, string | undefined> }) {
  const msg = sp.saved ? "Saved." : sp.deleted ? "Deleted." : sp.archived ? "It's used in past records, so it was hidden instead of deleted." : null;
  if (!msg) return null;
  return <p className="mb-6 rounded-[4px] border border-ok/30 bg-ok/10 px-4 py-2.5 text-sm text-ok" role="status">{msg}</p>;
}

const TONES: Record<string, string> = {
  PENDING_PAYMENT: "text-warn border-warn/40",
  QUOTED: "text-warn border-warn/40",
  CANCELLED: "text-bad border-bad/40",
  PAID: "text-ok border-ok/40",
  CONFIRMED: "text-ok border-ok/40",
  DELIVERED: "text-fg-2 border-line-2",
  RETURNED: "text-fg-2 border-line-2",
  SHIPPED: "text-volt-hi border-volt/40",
  READY: "text-volt-hi border-volt/40",
  PRINTING: "text-volt-hi border-volt/40",
  ACTIVE: "text-volt-hi border-volt/40",
  PACKED: "text-volt-hi border-volt/40",
};

export function Status({ value }: { value: string }) {
  return (
    <span className={clsx("inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-xs", TONES[value] ?? "border-line-2 text-fg-2")}>
      {value.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: string }) {
  const hasRows = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div className="overflow-x-auto rounded-[4px] border border-line">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-ink-2 text-xs text-fg-3">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">
          {hasRows ? children : (
            <tr><td colSpan={head.length} className="px-4 py-10 text-center text-fg-3">{empty ?? "Nothing here yet."}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function F({ label, name, children, hint, className }: { label: string; name: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <div className={clsx("flex flex-col", className)}>
      <label htmlFor={name} className="field-label">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-fg-3">{hint}</p>}
    </div>
  );
}

export function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-[#1e90ff]" />
      {label}
    </label>
  );
}

export function ImageInput({ current, label = "Image" }: { current?: string | null; label?: string }) {
  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="flex items-start gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-[4px] border border-line bg-ink-2">
          {current ? <Image src={current} alt="" fill sizes="96px" className="object-cover" /> : <span className="grid h-full place-items-center text-xs text-fg-3">None</span>}
        </div>
        <div className="space-y-2">
          <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/avif" className="block text-sm text-fg-2 file:mr-3 file:rounded-[4px] file:border file:border-line-2 file:bg-ink-3 file:px-3 file:py-1.5 file:text-fg" />
          <p className="text-xs text-fg-3">JPG, PNG, WebP or AVIF, under 8 MB. 1600 px wide or more looks best.</p>
          {current && <Check name="removeImage" label="Remove current image" />}
        </div>
      </div>
    </div>
  );
}

export const rupeesValue = (paise: number | null | undefined) => (paise === null || paise === undefined ? "" : String(paise / 100));
