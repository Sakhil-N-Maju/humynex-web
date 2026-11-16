"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import {
  List,
  X,
  ArrowUpRight,
  SquaresFour,
  Package,
  Receipt,
  Dog,
  CalendarCheck,
  Printer,
  Path,
  Tag,
  Users,
  ChatCircleText,
  SlidersHorizontal,
  AddressBook,
  IdentificationCard,
  ShieldCheck,
} from "@phosphor-icons/react";

const GROUPS = [
  { items: [{ href: "/admin", label: "Overview", icon: SquaresFour }] },
  {
    title: "Website",
    items: [
      { href: "/admin/rentals", label: "Rentals", icon: Dog },
      { href: "/admin/products", label: "Shop parts", icon: Package },
      { href: "/admin/projects", label: "Projects", icon: Path },
      { href: "/admin/about", label: "About page", icon: IdentificationCard },
      { href: "/admin/contact", label: "Contact details", icon: AddressBook },
    ],
  },
  {
    title: "Inbox & sales",
    items: [
      { href: "/admin/messages", label: "Messages", icon: ChatCircleText },
      { href: "/admin/orders", label: "Orders", icon: Receipt },
      { href: "/admin/bookings", label: "Rental bookings", icon: CalendarCheck },
      { href: "/admin/prints", label: "Print jobs", icon: Printer },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/admin/offers", label: "Offers", icon: Tag },
      { href: "/admin/content", label: "Site settings", icon: SlidersHorizontal },
      { href: "/admin/admins", label: "Admins", icon: ShieldCheck },
    ],
  },
];

function Logo() {
  return (
    <Link href="/admin" className="flex items-center gap-3">
      <Image src="/brand/logo-mark-160.webp" alt="" width={40} height={26} />
      <span className="leading-none">
        <span className="display block text-[1.05rem]">Humynex</span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-white/45">Admin</span>
      </span>
    </Link>
  );
}

function ViewSite({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white hover:text-white",
        className,
      )}
    >
      View site <ArrowUpRight size={12} weight="bold" />
    </Link>
  );
}

function NavList({ badges, className }: { badges: Record<string, number>; className?: string }) {
  const path = usePathname();
  return (
    <nav className={clsx("space-y-6", className)} aria-label="Admin">
      {GROUPS.map((g, gi) => (
        <div key={gi} className="space-y-0.5">
          {g.title && <p className="px-3 pb-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-white/40">{g.title}</p>}
          {g.items.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? path === href : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex items-center gap-3 rounded-full px-3.5 py-2.5 text-[0.9rem] transition-colors",
                  active ? "bg-white font-medium text-[#050816]" : "text-white/70 hover:bg-white/[0.07] hover:text-white",
                )}
              >
                <Icon size={18} weight={active ? "fill" : "regular"} className={active ? "text-[#1E90FF]" : ""} />
                <span className="whitespace-nowrap">{label}</span>
                {!!badges[href] && (
                  <span className="ml-auto grid min-w-[20px] place-items-center rounded-full bg-[#1E90FF] px-1.5 font-mono text-[0.65rem] font-semibold text-white">
                    {badges[href]}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/**
 * Admin sidebar. Desktop: a fixed column. Phones: logo + burger; the burger
 * opens a full-screen menu with every section, View site and the account box
 * (with Sign out).
 */
export function AdminSidebar({ badges, account }: { badges: Record<string, number>; account: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  // close after navigating
  useEffect(() => setOpen(false), [path]);

  // lock page scroll and close on Escape while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5 lg:block lg:px-6 lg:pt-7">
        <Logo />
        <ViewSite className="hidden lg:mt-6 lg:inline-flex" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="admin-menu"
          aria-label="Open menu"
          className="grid size-11 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-white lg:hidden"
        >
          <List size={20} />
        </button>
      </div>

      <div className="hidden lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        <NavList badges={badges} className="overflow-y-auto px-4 pt-6" />
        <div className="mt-auto px-6 pb-6 pt-4 text-xs">{account}</div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="admin-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Admin menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#050816] text-white lg:hidden"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-[#050816] px-5 pb-3 pt-5">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-11 place-items-center rounded-full border border-white/15 transition-colors hover:border-white"
              >
                <X size={20} />
              </button>
            </div>
            <NavList badges={badges} className="px-4 pt-4" />
            <div className="mt-auto space-y-5 px-6 pb-8 pt-10 text-sm">
              <ViewSite />
              {account}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
