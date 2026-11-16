import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.humynexrobotics.in";

// built on request so new products and projects appear (and the build needs no database)
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, rentals, projects] = await Promise.all([
    db.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    db.rentalItem.findMany({ where: { active: true }, select: { slug: true } }),
    db.project.findMany({ where: { published: true }, select: { slug: true } }),
  ]);
  const staticPages = ["", "/shop", "/rentals", "/print", "/projects", "/about", "/contact", "/privacy", "/terms", "/refund-policy", "/shipping-policy"];
  return [
    ...staticPages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...products.map((p) => ({ url: `${base}/shop/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...rentals.map((r) => ({ url: `${base}/rentals/${r.slug}`, priority: 0.6 })),
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, priority: 0.5 })),
  ];
}
