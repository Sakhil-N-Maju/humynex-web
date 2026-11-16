import { FitImage } from "@/components/ui/fit-image";
import {
  Cpu,
  Engine,
  Lightning,
  Eye,
  Cube,
  Plug,
  Dog,
  ForkKnife,
  MaskHappy,
  Robot,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import clsx from "clsx";

const ICONS: Record<string, Icon> = {
  Microcontrollers: Cpu,
  "Motors & Actuators": Engine,
  "Drivers & Power": Lightning,
  "Sensors & Vision": Eye,
  Kits: Cube,
  Accessories: Plug,
  "robot-dog": Dog,
  "serving-robot": ForkKnife,
  "bumblebee-costume": MaskHappy,
};

/**
 * Media plate. Shows the uploaded photo when there is one. Until the client
 * uploads photography, it renders a catalogue plate: a blueprint field with
 * the item's category glyph and reference code. It's deliberate and honest,
 * not a stock photo pretending to be the product.
 */
export function Plate({
  src,
  alt,
  kind,
  code,
  className,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority,
  chamfer = true,
}: {
  src?: string | null;
  alt: string;
  kind: string;
  code?: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
  chamfer?: boolean;
}) {
  const Glyph = ICONS[kind] ?? Robot;
  return (
    <div className={clsx("relative overflow-hidden bg-ink-2", chamfer && "chamfer", className)}>
      {src ? (
        <FitImage src={src} alt={alt} sizes={sizes} priority={priority} />
      ) : (
        <div className="absolute inset-0" role="img" aria-label={alt}>
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_20%,rgb(30_144_255/0.18),transparent_60%)]" />
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(rgb(120 170 255 / 0.07) 1px, transparent 1px), linear-gradient(90deg, rgb(120 170 255 / 0.07) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <Glyph weight="thin" className="size-[42%] text-volt-hi/70" />
          </div>
          {code && <span className="label absolute bottom-3 left-3 text-[0.65rem]">{code}</span>}
        </div>
      )}
    </div>
  );
}
