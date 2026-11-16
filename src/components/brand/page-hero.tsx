import clsx from "clsx";
import { Reveal } from "@/components/fx/reveal";

/**
 * The white opening panel every inner page starts with, in the landing hero's
 * voice: mono eyebrow, one large centred Inter Display line, a short sub.
 */
export function PageHero({
  eyebrow,
  title,
  sub,
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      data-theme="light"
      className={clsx("relative bg-white px-5 pb-28 pt-36 text-[#050816] md:px-8 md:pb-40 md:pt-48", className)}
    >
      <div className="mx-auto flex max-w-[1100px] flex-col items-center text-center">
        {eyebrow && (
          <Reveal>
            <p className="mb-6 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[#050816]/50">{eyebrow}</p>
          </Reveal>
        )}
        <Reveal delay={0.05}>
          <h1 className="display-wide max-w-[18ch] text-[2.6rem] sm:text-[3.4rem] md:text-[clamp(3.4rem,6vw,5.6rem)]">{title}</h1>
        </Reveal>
        {sub && (
          <Reveal delay={0.12}>
            <p className="mt-7 max-w-[56ch] text-lg leading-relaxed text-[#050816]/65 md:text-xl">{sub}</p>
          </Reveal>
        )}
        {children && (
          <Reveal delay={0.18}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">{children}</div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/** A rounded white sheet floating on the navy page, like the landing's trust and process panels. */
export function WhiteSheet({ children, className, id, label }: { children: React.ReactNode; className?: string; id?: string; label?: string }) {
  return (
    <section
      id={id}
      aria-label={label}
      data-theme="light"
      className={clsx("relative mx-auto rounded-[32px] bg-white px-5 py-20 text-[#050816] md:rounded-[48px] md:px-12 md:py-28", className)}
    >
      {children}
    </section>
  );
}

/** Rounded top edge the dark page rises over a white hero with. */
export const darkCurve = "relative z-10 -mt-8 rounded-t-[32px] bg-[#050816] md:-mt-12 md:rounded-t-[48px]";

/** Dark band with the landing's section rhythm. `curve` rounds its top and lifts it over the white hero above. */
export function DarkBand({
  children,
  className,
  id,
  label,
  curve,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  label?: string;
  curve?: boolean;
}) {
  return (
    <section id={id} aria-label={label} data-theme="dark" className={clsx("relative px-5 py-20 md:px-8 md:py-28", curve && darkCurve, className)}>
      {children}
    </section>
  );
}

/** A bare curved dark edge, for white panels that have no dark section right after them. */
export function DarkCurve() {
  return <div aria-hidden="true" data-theme="dark" className={clsx(darkCurve, "h-8 md:h-12")} />;
}

/** "(01) Label" marker used above section headings on the landing page. */
export function SectionLabel({ n, children, dark }: { n?: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={clsx("font-mono text-[0.72rem] uppercase tracking-[0.1em]", dark ? "text-white/50" : "text-[#050816]/50")}>
      {n && <span className="mr-2">({n})</span>}
      {children}
    </p>
  );
}

export const btnBlue =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1E90FF] px-6 text-[0.95rem] font-semibold text-white transition-colors hover:bg-[#1A7FE6]";
export const btnNavy =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#050816] px-6 text-[0.95rem] font-medium text-white transition-colors hover:bg-[#1E90FF] hover:text-white";
export const btnOutlineDark =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#050816]/20 px-6 text-[0.95rem] font-medium text-[#050816] transition-colors hover:border-[#050816]";
export const btnOutlineLight =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 text-[0.95rem] font-medium text-white transition-colors hover:border-white";
