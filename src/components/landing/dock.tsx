"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Bag, List, UserCircle, X } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart, cartCount } from "@/components/cart/cart-store";
import { useMounted } from "@/lib/use-client-state";
import { useMe } from "@/components/site/use-me";
import clsx from "clsx";
import { getLenis } from "@/components/fx/smooth-scroll";

export type DockLink = { href: string; label: string };

function go(href: string) {
  const lenis = getLenis();
  if (href === "#top") {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.querySelector(href);
  if (!el) return;
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -8 });
  else el.scrollIntoView({ behavior: "smooth" });
}

/** Grows toward the pointer like a macOS dock. */
function DockItem({ mouseX, children, base = 1, boost = 0.16 }: { mouseX: MotionValue<number>; children: React.ReactNode; base?: number; boost?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const dist = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect();
    if (!b || !Number.isFinite(x)) return 999;
    return Math.abs(x - (b.left + b.width / 2));
  });
  const scaleRaw = useTransform(dist, [0, 90, 180], [base + boost, base + boost * 0.35, base]);
  const scale = useSpring(scaleRaw, { stiffness: 320, damping: 24 });
  return (
    <motion.div ref={ref} style={{ scale: reduce ? base : scale }} className="origin-center">
      {children}
    </motion.div>
  );
}

export function Dock({ left, right }: { left: DockLink[]; right: DockLink[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const me = useMe();
  const openCart = useCart((s) => s.setOpen);
  const lines = useCart((s) => s.lines);
  const mounted = useMounted();
  const count = mounted ? cartCount(lines) : 0;
  const isActive = (href: string) => !href.startsWith("#") && (pathname === href || pathname.startsWith(href + "/"));
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();

  // Read the theme of whatever section is under the dock right now.
  const sample = () => {
    const b = bar.current?.getBoundingClientRect();
    if (!b) return;
    const hits = document.elementsFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    const under = hits.find((el) => !bar.current?.contains(el));
    const t = (under?.closest("[data-theme]") as HTMLElement | null)?.dataset.theme;
    const next = t === "light" ? "light" : "dark";
    setTheme((cur) => (cur === next ? cur : next));
  };
  useMotionValueEvent(scrollY, "change", sample);
  useEffect(() => {
    const id = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  const light = theme === "light";
  const linkCls = "block whitespace-nowrap rounded-full px-4 py-2 text-[0.9rem] font-medium transition-colors";

  const renderLink = (l: DockLink, icon?: React.ReactNode) => {
    const active = isActive(l.href);
    return (
      <DockItem key={l.href} mouseX={mouseX}>
        <Link
          href={l.href}
          aria-current={active ? "page" : undefined}
          onClick={(e) => {
            // in-page sections scroll smoothly; real pages navigate normally
            if (!l.href.startsWith("#")) return;
            e.preventDefault();
            go(l.href);
          }}
          className={clsx(
            linkCls,
            active
              ? light
                ? "bg-[#050816] text-white"
                : "bg-white text-[#050816]"
              : light
                ? "hover:text-[#1E90FF]"
                : "hover:text-[#67D4FF]",
          )}
        >
          {icon}
          {l.label}
        </Link>
      </DockItem>
    );
  };

  return (
    <>
      <motion.nav
        ref={bar}
        aria-label="Main"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        onPointerMove={(e) => mouseX.set(e.clientX)}
        onPointerLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
        className={clsx(
          "fixed left-1/2 top-4 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full border px-3 py-1.5 lg:gap-2 lg:px-5 backdrop-blur-md transition-colors duration-500",
          light ? "border-ink/15 bg-white/40 text-ink" : "border-white/15 bg-ink/30 text-white",
        )}
      >
        <div className="hidden items-center gap-1 lg:flex xl:gap-4">{left.map((l) => renderLink(l))}</div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={clsx("grid size-10 place-items-center rounded-full lg:hidden", light ? "hover:bg-ink/[0.07]" : "hover:bg-white/10")}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <List size={20} />
        </button>

        <DockItem mouseX={mouseX} boost={0.2}>
          <Link
            href="/"
            onClick={(e) => {
              // already home: glide back to the top instead of reloading
              if (pathname !== "/") return;
              e.preventDefault();
              go("#top");
            }}
            aria-label="Humynex Robotics home"
            className={clsx("mx-4 grid h-11 w-20 place-items-center rounded-full lg:mx-6 xl:mx-12", light ? "hover:bg-ink/[0.07]" : "hover:bg-white/10")}
          >
            <Image src="/brand/logo-mark-160.webp" alt="" width={46} height={30} priority />
          </Link>
        </DockItem>

        <div className="hidden items-center gap-1 lg:flex xl:gap-4">
          {right.map((l) => renderLink(l))}
          {renderLink(
            me
              ? { href: me.isAdmin ? "/admin" : "/account", label: me.isAdmin ? "Admin" : `${me.points} pts` }
              : { href: "/login", label: "Sign in" },
            <UserCircle size={18} className="-ml-1 mr-1.5 inline-block align-[-0.2em]" />,
          )}
          <DockItem mouseX={mouseX}>
            <button
              type="button"
              onClick={() => openCart(true)}
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
              className={clsx(linkCls, "relative inline-flex items-center gap-1.5", light ? "hover:text-[#1E90FF]" : "hover:text-[#67D4FF]")}
            >
              <Bag size={18} />
              Cart
              {count > 0 && (
                <span className="grid min-w-[18px] place-items-center rounded-full bg-[#1E90FF] px-1 font-mono text-[0.65rem] font-semibold text-[#050816]">
                  {count}
                </span>
              )}
            </button>
          </DockItem>
        </div>
        <button
          type="button"
          onClick={() => openCart(true)}
          className={clsx("grid size-10 place-items-center rounded-full lg:hidden", light ? "hover:bg-ink/[0.07]" : "hover:bg-white/10")}
          aria-label="Open cart"
        >
          <Bag size={20} />
        </button>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-ink/95 px-6 pt-6 pb-10 text-white backdrop-blur lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex justify-end">
              <button type="button" onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-full hover:bg-white/10" aria-label="Close menu">
                <X size={22} />
              </button>
            </div>
            <nav className="mt-6 flex flex-col">
              {[
                { href: "/", label: "Home" },
                ...left,
                ...right,
                { href: "/contact", label: "Contact" },
                me ? { href: me.isAdmin ? "/admin" : "/account", label: me.isAdmin ? "Admin" : "My account" } : { href: "/login", label: "Sign in" },
              ].map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  aria-current={isActive(l.href) || (l.href === "/" && pathname === "/") ? "page" : undefined}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    if (l.href.startsWith("#")) setTimeout(() => go(l.href), 50);
                    else router.push(l.href);
                  }}
                  className={clsx("display border-b border-white/10 py-4 text-3xl", (isActive(l.href) || (l.href === "/" && pathname === "/")) && "text-[#67D4FF]")}
                >
                  {l.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
