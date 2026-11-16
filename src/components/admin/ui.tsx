import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { Plus, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { SubmitButton, ConfirmButton } from "./client";

export { SubmitButton, ConfirmButton };

/** Page title in the site's voice: mono eyebrow, big Inter Display heading, one action pill. */
export function PageHead({
  title,
  sub,
  eyebrow,
  action,
}: {
  title: string;
  sub?: string;
  eyebrow?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
      <div>
        {eyebrow && <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-fg-3">{eyebrow}</p>}
        <h1 className="display-wide text-[2.2rem] md:text-[2.9rem]">{title}</h1>
        {sub && <p className="mt-3 max-w-[60ch] text-fg-2">{sub}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn btn-primary">
          <Plus size={16} weight="bold" /> {action.label}
        </Link>
      )}
    </div>
  );
}

/** "Back to list" link above an edit form. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-fg-3 transition-colors hover:text-[#1E90FF]">
      <ArrowLeft size={13} /> {label}
    </Link>
  );
}

export function Flash({ sp }: { sp: Record<string, string | undefined> }) {
  const demo = !!sp.demo;
  const error = sp.invalid
    ? "That doesn't look like a valid email address."
    : sp.badlink
      ? "That isn't a valid web link. Paste the full tracking link, starting with https://"
      : sp.badprice
        ? "Check the rent: it must be at least ₹1, and the deposit can't be negative."
        : sp.clash
          ? "Those dates are no longer free: another approved booking uses the units. Offer the customer other dates, or decline."
          : sp.notenquiry
            ? "This booking has already been reviewed."
            : null;
  const bad = !!error;
  const msg = demo
    ? "This is the demo site, so changes aren't saved. Everything else works as it will on the live admin."
    : error
      ? error
      : sp.approved
        ? "Approved. The dates are held, and the customer can now pay from their account."
        : sp.declined
          ? "Declined. The enquiry is closed."
          : sp.saved
        ? "Saved. The website is updated."
        : sp.deleted
          ? "Deleted."
          : sp.archived
            ? "It's used in past records, so it was hidden instead of deleted."
            : null;
  if (!msg) return null;
  return (
    <p
      className={clsx(
        "mb-8 flex items-center gap-3 rounded-full px-5 py-3 text-sm font-medium",
        demo ? "bg-[#1E90FF]/10 text-[#0b5cad]" : bad ? "bg-bad/10 text-bad" : "bg-ok/10 text-ok",
      )}
      role="status"
    >
      <span className={clsx("size-2 shrink-0 rounded-full", demo ? "bg-[#1E90FF]" : bad ? "bg-bad" : "bg-ok")} aria-hidden="true" />
      {msg}
    </p>
  );
}

const TONES: Record<string, string> = {
  ENQUIRY: "text-warn bg-warn/10",
  APPROVED: "text-[#1E90FF] bg-[#1E90FF]/10",
  PENDING_PAYMENT: "text-warn bg-warn/10",
  QUOTED: "text-warn bg-warn/10",
  CANCELLED: "text-bad bg-bad/10",
  PAID: "text-ok bg-ok/10",
  CONFIRMED: "text-ok bg-ok/10",
  DELIVERED: "text-fg-2 bg-ink-2",
  RETURNED: "text-fg-2 bg-ink-2",
  SHIPPED: "text-[#1E90FF] bg-[#1E90FF]/10",
  READY: "text-[#1E90FF] bg-[#1E90FF]/10",
  PRINTING: "text-[#1E90FF] bg-[#1E90FF]/10",
  ACTIVE: "text-[#1E90FF] bg-[#1E90FF]/10",
  PACKED: "text-[#1E90FF] bg-[#1E90FF]/10",
};

export function Status({ value }: { value: string }) {
  return (
    <span className={clsx("inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium", TONES[value] ?? "bg-ink-2 text-fg-2")}>
      {value.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

/** Live / hidden pill for catalogue rows. */
export function LiveTag({ live, liveLabel = "Live", hiddenLabel = "Hidden" }: { live: boolean; liveLabel?: string; hiddenLabel?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", live ? "bg-ok/10 text-ok" : "bg-ink-2 text-fg-3")}>
      <span className={clsx("size-1.5 rounded-full", live ? "bg-ok" : "bg-fg-3")} aria-hidden="true" />
      {live ? liveLabel : hiddenLabel}
    </span>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: string }) {
  const hasRows = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    // relative: keeps absolutely-positioned bits inside (e.g. sr-only labels),
    // otherwise they escape the scroll box and widen the whole page on phones
    <div className="relative overflow-x-auto rounded-[24px] border border-line">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-ink-2 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-fg-3">
          <tr>{head.map((h) => <th key={h} className="px-5 py-3.5 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line [&_td]:px-5 [&_td]:py-4 [&_tr]:transition-colors [&_tr:hover]:bg-ink-2/60">
          {hasRows ? children : (
            <tr><td colSpan={head.length} className="!py-14 text-center text-fg-3">{empty ?? "Nothing here yet."}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** A titled group of fields, as a rounded card. */
export function Card({ title, sub, children, className, id }: { title?: string; sub?: string; children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={clsx("scroll-mt-8 rounded-[24px] border border-line p-6 md:p-8", className)}>
      {title && <h2 className="display text-xl">{title}</h2>}
      {sub && <p className="mt-1.5 max-w-[60ch] text-sm text-fg-2">{sub}</p>}
      <div className={clsx(title || sub ? "mt-6" : "", "space-y-5")}>{children}</div>
    </section>
  );
}

export function F({ label, name, children, hint, className }: { label: string; name: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <div className={clsx("flex flex-col", className)}>
      <label htmlFor={name} className="mb-2 text-sm font-medium text-fg">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-fg-3">{hint}</p>}
    </div>
  );
}

export function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-full border border-line-2 px-4 py-2.5 text-sm transition-colors has-[:checked]:border-[#1E90FF] has-[:checked]:bg-[#1E90FF]/[0.06]">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-[#1e90ff]" />
      {label}
    </label>
  );
}

export function ImageInput({ current, label = "Image" }: { current?: string | null; label?: string }) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-fg">{label}</span>
      <div className="flex flex-wrap items-start gap-5">
        <div className="relative aspect-[4/3] w-44 shrink-0 overflow-hidden rounded-[18px] bg-ink-2">
          {current ? (
            <Image src={current} alt="" fill sizes="176px" className="object-cover" />
          ) : (
            <span className="grid h-full place-items-center font-mono text-[0.68rem] uppercase tracking-[0.1em] text-fg-3">No image</span>
          )}
        </div>
        <div className="space-y-3">
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="block text-sm text-fg-2 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#050816] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#1E90FF]"
          />
          <p className="text-xs text-fg-3">JPG, PNG, WebP or AVIF, under 4 MB. About 1600 px wide looks best.</p>
          {current && <Check name="removeImage" label="Remove current image" />}
        </div>
      </div>
    </div>
  );
}

/** Save / cancel row at the bottom of an edit form. */
export function FormActions({ saveLabel, cancelHref }: { saveLabel: string; cancelHref: string }) {
  return (
    <div className="sticky bottom-3 z-10 flex items-center gap-3 rounded-full border border-line bg-white/90 p-2 pl-5 shadow-[0_12px_32px_-16px_rgba(5,8,22,0.35)] backdrop-blur">
      <span className="mr-auto hidden text-sm text-fg-3 sm:block">Changes go live on the website when you save.</span>
      <Link href={cancelHref} className="btn btn-sm text-fg-2 hover:text-fg">Cancel</Link>
      <SubmitButton>{saveLabel}</SubmitButton>
    </div>
  );
}

export const rupeesValue = (paise: number | null | undefined) => (paise === null || paise === undefined ? "" : String(paise / 100));

/** Header of an edit page: back link, big title, optional "view on site". */
export function EditHead({ backHref, backLabel, title, viewHref }: { backHref: string; backLabel: string; title: string; viewHref?: string }) {
  return (
    <div className="mb-10 border-b border-line pb-8">
      <BackLink href={backHref} label={backLabel} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display-wide text-[2.2rem] md:text-[2.9rem]">{title}</h1>
        {viewHref && (
          <Link href={viewHref} target="_blank" className="btn btn-ghost btn-sm">
            View on site
          </Link>
        )}
      </div>
    </div>
  );
}

/** Delete button in its own quiet card at the end of an edit page. */
export function DangerZone({
  action,
  id,
  label,
  message,
  note,
}: {
  action: (fd: FormData) => Promise<void>;
  id: string;
  label: string;
  message: string;
  note: string;
}) {
  return (
    <form action={action} className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-dashed border-line-2 px-6 py-5">
      <input type="hidden" name="id" value={id} />
      <p className="max-w-[52ch] text-sm text-fg-3">{note}</p>
      <ConfirmButton message={message}>{label}</ConfirmButton>
    </form>
  );
}

/** Small thumbnail for list rows. */
export function Thumb({ src, round }: { src?: string | null; round?: boolean }) {
  return (
    <span className={clsx("relative block size-12 shrink-0 overflow-hidden bg-ink-2", round ? "rounded-full" : "rounded-[12px]")}>
      {src ? <Image src={src} alt="" fill sizes="48px" className="object-cover" /> : null}
    </span>
  );
}
