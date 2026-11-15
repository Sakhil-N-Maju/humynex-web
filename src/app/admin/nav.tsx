"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
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

export function AdminNav({ badges }: { badges: Record<string, number> }) {
  const path = usePathname();
  return (
    <nav
      className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] lg:block lg:space-y-6 lg:overflow-y-auto lg:px-4 lg:pb-0 lg:pt-6 [&::-webkit-scrollbar]:hidden"
      aria-label="Admin"
    >
      {GROUPS.map((g, gi) => (
        <div key={gi} className="flex gap-1 lg:block lg:space-y-0.5">
          {g.title && <p className="hidden px-3 pb-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-white/40 lg:block">{g.title}</p>}
          {g.items.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? path === href : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex shrink-0 items-center gap-3 rounded-full px-3.5 py-2.5 text-[0.9rem] transition-colors",
                  active ? "bg-white font-medium text-[#050816]" : "text-white/70 hover:bg-white/[0.07] hover:text-white",
                )}
              >
                <Icon size={18} weight={active ? "fill" : "regular"} className={active ? "text-[#1E90FF]" : ""} />
                <span className="whitespace-nowrap">{label}</span>
                {!!badges[href] && (
                  <span className="ml-auto grid min-w-[20px] place-items-center rounded-full bg-[#1E90FF] px-1.5 font-mono text-[0.65rem] font-semibold text-[#050816]">
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
