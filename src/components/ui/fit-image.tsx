import Image from "next/image";
import clsx from "clsx";

/**
 * Shows the whole photo inside a fixed-shape frame, never cropped or zoomed:
 * the photo is fitted (object-contain), and any space around it is filled with
 * a blurred, dimmed copy of the same photo instead of empty bars.
 * Fills its nearest positioned parent, like next/image `fill`.
 */
export function FitImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** applies to the whole picture (e.g. `mono`, hover scale) */
  className?: string;
}) {
  return (
    <div className={clsx("absolute inset-0 overflow-clip", className)}>
      {/* backdrop: a tiny copy, blurred, so it costs almost nothing to load */}
      <Image src={src} alt="" aria-hidden fill sizes="96px" className="scale-125 object-cover blur-2xl brightness-[0.55] saturate-150" />
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain" />
    </div>
  );
}
