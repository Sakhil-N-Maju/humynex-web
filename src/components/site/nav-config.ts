import type { DockLink } from "@/components/landing/dock";

// Every page in the main nav has its own route; nothing scrolls within the landing page.
export const NAV_LEFT: DockLink[] = [
  { href: "/shop", label: "Shop" },
  { href: "/rentals", label: "Rentals" },
  { href: "/print", label: "3D Print" },
  { href: "/projects", label: "Projects" },
];

export const NAV_RIGHT: DockLink[] = [
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];
