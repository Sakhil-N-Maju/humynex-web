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
  UsersThree,
  Tag,
  Users,
  ChatCircleText,
  PencilSimpleLine,
} from "@phosphor-icons/react";

const GROUPS = [
  { items: [{ href: "/admin", label: "Overview", icon: SquaresFour }] },
  {
    title: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: Receipt },
      { href: "/admin/bookings", label: "Rental bookings", icon: CalendarCheck },
      { href: "/admin/prints", label: "Print jobs", icon: Printer },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/messages", label: "Messages", icon: ChatCircleText },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/rentals", label: "Rental fleet", icon: Dog },
      { href: "/admin/offers", label: "Offers", icon: Tag },
    ],
  },
  {
    title: "Website",
    items: [
      { href: "/admin/projects", label: "Projects", icon: Path },
      { href: "/admin/team", label: "Team", icon: UsersThree },
      { href: "/admin/content", label: "Content & settings", icon: PencilSimpleLine },
    ],
  },
];

export function AdminNav({ badges }: { badges: Record<string, number> }) {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-5 lg:overflow-visible lg:pb-0 lg:pt-2" aria-label="Admin">
      {GROUPS.map((g, gi) => (
        <div key={gi} className="flex gap-1 lg:block lg:space-y-0.5">
          {g.title && <p className="hidden px-2 pb-1 text-[0.7rem] font-semibold uppercase tracking-wider text-fg-3 lg:block">{g.title}</p>}
          {g.items.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? path === href : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex shrink-0 items-center gap-2.5 rounded-[4px] px-2.5 py-2 text-sm transition-colors",
                  active ? "bg-volt/15 text-fg" : "text-fg-2 hover:bg-ink-3 hover:text-fg",
                )}
              >
                <Icon size={18} weight={active ? "fill" : "regular"} className={active ? "text-volt-hi" : ""} />
                <span className="whitespace-nowrap">{label}</span>
                {!!badges[href] && <span className="ml-auto rounded-full bg-volt px-1.5 font-mono text-[0.65rem] text-ink">{badges[href]}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
