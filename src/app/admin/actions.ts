"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertAdmin } from "@/lib/auth";
import { saveImage } from "@/lib/uploads";
import { saveSetting, getSettings, type Settings } from "@/lib/settings";

/* ---------------- form helpers ---------------- */
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const opt = (fd: FormData, k: string) => str(fd, k) || null;
const int = (fd: FormData, k: string, d = 0) => {
  const n = parseInt(str(fd, k), 10);
  return Number.isFinite(n) ? n : d;
};
const paise = (fd: FormData, k: string) => {
  const v = parseFloat(str(fd, k).replace(/[,₹\s]/g, ""));
  return Number.isFinite(v) ? Math.round(v * 100) : 0;
};
const optPaise = (fd: FormData, k: string) => (str(fd, k) ? paise(fd, k) : null);
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
const list = (fd: FormData, k: string) =>
  JSON.stringify(
    str(fd, k)
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean),
  );
const specs = (fd: FormData, k: string) =>
  JSON.stringify(
    str(fd, k)
      .split(/\r?\n/)
      .map((l) => l.split(":"))
      .filter((p) => p.length >= 2 && p[0].trim())
      .map(([label, ...rest]) => ({ label: label.trim(), value: rest.join(":").trim() })),
  );
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
const date = (fd: FormData, k: string) => {
  const s = str(fd, k);
  return s ? new Date(`${s}T00:00:00`) : null;
};

async function image(fd: FormData, folder: string, current: string | null) {
  if (bool(fd, "removeImage")) return null;
  const uploaded = await saveImage(fd.get("image"), folder);
  return uploaded ?? current;
}

function done(path: string, msg = "saved"): never {
  revalidatePath("/", "layout");
  redirect(`${path}?${msg}=1`);
}

async function uniqueSlug(model: "product" | "rentalItem" | "project", base: string, id?: string) {
  let slug = slugify(base) || "item";
  for (let i = 2; ; i++) {
    const hit =
      model === "product"
        ? await db.product.findUnique({ where: { slug } })
        : model === "rentalItem"
          ? await db.rentalItem.findUnique({ where: { slug } })
          : await db.project.findUnique({ where: { slug } });
    if (!hit || hit.id === id) return slug;
    slug = `${slugify(base)}-${i}`;
  }
}

/* ---------------- products ---------------- */
export async function saveProduct(fd: FormData) {
  await assertAdmin();
  const id = opt(fd, "id");
  const existing = id ? await db.product.findUnique({ where: { id } }) : null;
  const name = str(fd, "name");
  if (!name) throw new Error("Name is required.");
  const data = {
    name,
    slug: await uniqueSlug("product", str(fd, "slug") || name, id ?? undefined),
    category: str(fd, "category") || "Accessories",
    brand: opt(fd, "brand"),
    sku: opt(fd, "sku"),
    price: paise(fd, "price"),
    compareAt: optPaise(fd, "compareAt"),
    stock: int(fd, "stock"),
    summary: str(fd, "summary"),
    description: str(fd, "description"),
    specs: specs(fd, "specs"),
    featured: bool(fd, "featured"),
    active: bool(fd, "active"),
    image: await image(fd, "products", existing?.image ?? null),
  };
  if (existing) await db.product.update({ where: { id: existing.id }, data });
  else await db.product.create({ data });
  done("/admin/products");
}

export async function deleteProduct(fd: FormData) {
  await assertAdmin();
  const id = str(fd, "id");
  const used = await db.orderItem.count({ where: { productId: id } });
  // products that appear in past orders are hidden, not deleted, to keep order history intact
  if (used) await db.product.update({ where: { id }, data: { active: false } });
  else await db.product.delete({ where: { id } });
  done("/admin/products", used ? "archived" : "deleted");
}

/* ---------------- rentals ---------------- */
export async function saveRental(fd: FormData) {
  await assertAdmin();
  const id = opt(fd, "id");
  const existing = id ? await db.rentalItem.findUnique({ where: { id } }) : null;
  const name = str(fd, "name");
  if (!name) throw new Error("Name is required.");
  const data = {
    name,
    slug: await uniqueSlug("rentalItem", str(fd, "slug") || name, id ?? undefined),
    kind: str(fd, "kind") || "ROBOT",
    tagline: str(fd, "tagline"),
    description: str(fd, "description"),
    dailyRate: paise(fd, "dailyRate"),
    deposit: paise(fd, "deposit"),
    minDays: Math.max(1, int(fd, "minDays", 1)),
    units: Math.max(1, int(fd, "units", 1)),
    includes: list(fd, "includes"),
    goodFor: list(fd, "goodFor"),
    featured: bool(fd, "featured"),
    active: bool(fd, "active"),
    sortOrder: int(fd, "sortOrder"),
    image: await image(fd, "rentals", existing?.image ?? null),
  };
  if (existing) await db.rentalItem.update({ where: { id: existing.id }, data });
  else await db.rentalItem.create({ data });
  done("/admin/rentals");
}

export async function deleteRental(fd: FormData) {
  await assertAdmin();
  const id = str(fd, "id");
  const used = await db.rentalBooking.count({ where: { itemId: id } });
  if (used) await db.rentalItem.update({ where: { id }, data: { active: false } });
  else await db.rentalItem.delete({ where: { id } });
  done("/admin/rentals", used ? "archived" : "deleted");
}

/* ---------------- projects ---------------- */
export async function saveProject(fd: FormData) {
  await assertAdmin();
  const id = opt(fd, "id");
  const existing = id ? await db.project.findUnique({ where: { id } }) : null;
  const title = str(fd, "title");
  if (!title) throw new Error("Title is required.");
  const data = {
    title,
    slug: await uniqueSlug("project", str(fd, "slug") || title, id ?? undefined),
    tag: str(fd, "tag") || "Hardware",
    status: str(fd, "status") || "Delivered",
    year: int(fd, "year", new Date().getFullYear()),
    client: opt(fd, "client"),
    summary: str(fd, "summary"),
    body: str(fd, "body"),
    outcomes: list(fd, "outcomes"),
    stack: list(fd, "stack"),
    featured: bool(fd, "featured"),
    published: bool(fd, "published"),
    sortOrder: int(fd, "sortOrder"),
    cover: await image(fd, "projects", existing?.cover ?? null),
  };
  if (existing) await db.project.update({ where: { id: existing.id }, data });
  else await db.project.create({ data });
  done("/admin/projects");
}

export async function deleteProject(fd: FormData) {
  await assertAdmin();
  await db.project.delete({ where: { id: str(fd, "id") } });
  done("/admin/projects", "deleted");
}

/* ---------------- team ---------------- */
export async function saveTeam(fd: FormData) {
  await assertAdmin();
  const id = opt(fd, "id");
  const existing = id ? await db.teamMember.findUnique({ where: { id } }) : null;
  const data = {
    name: str(fd, "name") || "Team member",
    role: str(fd, "role"),
    bio: str(fd, "bio"),
    linkedin: opt(fd, "linkedin"),
    active: bool(fd, "active"),
    sortOrder: int(fd, "sortOrder"),
    // saving a profile with a real name marks it as no longer a placeholder
    isPlaceholder: bool(fd, "isPlaceholder"),
    photo: await image(fd, "team", existing?.photo ?? null),
  };
  if (existing) await db.teamMember.update({ where: { id: existing.id }, data });
  else await db.teamMember.create({ data });
  done("/admin/team");
}

export async function deleteTeam(fd: FormData) {
  await assertAdmin();
  await db.teamMember.delete({ where: { id: str(fd, "id") } });
  done("/admin/team", "deleted");
}

/* ---------------- offers ---------------- */
export async function saveCoupon(fd: FormData) {
  await assertAdmin();
  const id = opt(fd, "id");
  const type = str(fd, "type") === "FLAT" ? "FLAT" : "PERCENT";
  const code = str(fd, "code").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!code) throw new Error("Code is required.");
  const data = {
    code,
    title: str(fd, "title"),
    description: str(fd, "description"),
    type,
    value: type === "FLAT" ? paise(fd, "value") : Math.min(100, Math.max(1, int(fd, "value"))),
    minOrder: paise(fd, "minOrder"),
    maxDiscount: optPaise(fd, "maxDiscount"),
    appliesTo: ["SHOP", "RENTAL", "PRINT"].includes(str(fd, "appliesTo")) ? str(fd, "appliesTo") : "ALL",
    membersOnly: bool(fd, "membersOnly"),
    startsAt: date(fd, "startsAt"),
    endsAt: date(fd, "endsAt"),
    usageLimit: str(fd, "usageLimit") ? int(fd, "usageLimit") : null,
    showOnSite: bool(fd, "showOnSite"),
    active: bool(fd, "active"),
  };
  if (id) await db.coupon.update({ where: { id }, data });
  else await db.coupon.create({ data });
  done("/admin/offers");
}

export async function deleteCoupon(fd: FormData) {
  await assertAdmin();
  await db.coupon.delete({ where: { id: str(fd, "id") } });
  done("/admin/offers", "deleted");
}

/* ---------------- orders / bookings / prints ---------------- */
const ORDER_STATUSES = ["PENDING_PAYMENT", "PAID", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

export async function setOrderStatus(fd: FormData) {
  await assertAdmin();
  const id = str(fd, "id");
  const status = str(fd, "status");
  if (!ORDER_STATUSES.includes(status)) throw new Error("Unknown status");
  await db.$transaction(async (tx) => {
    const o = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    if (status === "CANCELLED" && o.status !== "CANCELLED") {
      const wasPaid = o.status !== "PENDING_PAYMENT";
      if (o.userId && o.pointsUsed > 0) {
        await tx.user.update({ where: { id: o.userId }, data: { points: { increment: o.pointsUsed } } });
        await tx.pointsEntry.create({ data: { userId: o.userId, delta: o.pointsUsed, reason: "REFUND", refType: "ORDER", refId: o.id, note: `Order ${o.number} cancelled` } });
      }
      if (o.userId && o.pointsEarned > 0) {
        const u = await tx.user.findUniqueOrThrow({ where: { id: o.userId } });
        const take = Math.min(u.points, o.pointsEarned);
        await tx.user.update({ where: { id: o.userId }, data: { points: { decrement: take }, lifetimePts: { decrement: Math.min(u.lifetimePts, o.pointsEarned) } } });
        await tx.pointsEntry.create({ data: { userId: o.userId, delta: -take, reason: "ADMIN_ADJUST", refType: "ORDER", refId: o.id, note: `Points from cancelled order ${o.number}` } });
      }
      if (wasPaid) {
        for (const it of o.items) await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.qty } } });
      }
    }
    await tx.order.update({ where: { id }, data: { status } });
  });
  done(`/admin/orders/${id}`);
}

const BOOKING_STATUSES = ["PENDING_PAYMENT", "CONFIRMED", "ACTIVE", "RETURNED", "CANCELLED"];
export async function setBookingStatus(fd: FormData) {
  await assertAdmin();
  const status = str(fd, "status");
  if (!BOOKING_STATUSES.includes(status)) throw new Error("Unknown status");
  await db.rentalBooking.update({ where: { id: str(fd, "id") }, data: { status } });
  done("/admin/bookings");
}

const PRINT_STATUSES = ["QUOTED", "PENDING_PAYMENT", "PAID", "PRINTING", "READY", "SHIPPED", "CANCELLED"];
export async function updatePrintJob(fd: FormData) {
  await assertAdmin();
  const id = str(fd, "id");
  const status = str(fd, "status");
  if (!PRINT_STATUSES.includes(status)) throw new Error("Unknown status");
  const manual = str(fd, "estimate");
  await db.printJob.update({
    where: { id },
    data: {
      status,
      ...(manual ? { estimate: paise(fd, "estimate"), needsReview: false } : {}),
    },
  });
  done(`/admin/prints/${id}`);
}

/* ---------------- messages / customers ---------------- */
export async function toggleMessage(fd: FormData) {
  await assertAdmin();
  await db.contactMessage.update({ where: { id: str(fd, "id") }, data: { read: bool(fd, "read") } });
  done("/admin/messages");
}

export async function deleteMessage(fd: FormData) {
  await assertAdmin();
  await db.contactMessage.delete({ where: { id: str(fd, "id") } });
  done("/admin/messages", "deleted");
}

export async function adjustPoints(fd: FormData) {
  await assertAdmin();
  const userId = str(fd, "userId");
  const delta = int(fd, "delta");
  if (!delta) throw new Error("Enter a non-zero amount.");
  await db.$transaction(async (tx) => {
    const u = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const applied = delta < 0 ? -Math.min(u.points, -delta) : delta;
    await tx.user.update({
      where: { id: userId },
      data: { points: { increment: applied }, ...(applied > 0 ? { lifetimePts: { increment: applied } } : {}) },
    });
    await tx.pointsEntry.create({ data: { userId, delta: applied, reason: "ADMIN_ADJUST", note: str(fd, "note") || "Adjusted by admin" } });
  });
  done("/admin/customers");
}

/* ---------------- site content / settings ---------------- */
export async function saveSettingsSection(fd: FormData) {
  await assertAdmin();
  const section = str(fd, "section") as keyof Settings;
  const s = await getSettings();
  switch (section) {
    case "hero":
      await saveSetting("hero", { headline: str(fd, "headline"), sub: str(fd, "sub") });
      break;
    case "announcement":
      await saveSetting("announcement", { enabled: bool(fd, "enabled"), text: str(fd, "text"), href: str(fd, "href") || "/" });
      break;
    case "contact":
      await saveSetting("contact", {
        ...s.contact,
        email: str(fd, "email"),
        careersEmail: str(fd, "careersEmail"),
        phones: str(fd, "phones").split(/\r?\n/).map((x) => x.trim()).filter(Boolean),
        address: str(fd, "address").split(/\r?\n/).map((x) => x.trim()).filter(Boolean),
        mapsUrl: str(fd, "mapsUrl"),
        hours: str(fd, "hours"),
        social: { instagram: str(fd, "instagram"), linkedin: str(fd, "linkedin"), youtube: str(fd, "youtube") },
      });
      break;
    case "mission":
      await saveSetting("mission", {
        vision: str(fd, "vision"),
        visionBody: str(fd, "visionBody"),
        mission: str(fd, "mission"),
        missionBody: str(fd, "missionBody"),
        quote: str(fd, "quote"),
      });
      break;
    case "stats":
      await saveSetting(
        "stats",
        [0, 1, 2].map((i) => ({ value: int(fd, `value${i}`), suffix: str(fd, `suffix${i}`), label: str(fd, `label${i}`) })).filter((x) => x.label),
      );
      break;
    case "rewards":
      await saveSetting("rewards", {
        signupBonus: Math.max(0, int(fd, "signupBonus")),
        pointsPer100: Math.max(0, int(fd, "pointsPer100")),
        maxRedeemPct: Math.min(100, Math.max(0, int(fd, "maxRedeemPct"))),
      });
      break;
    case "shipping":
      await saveSetting("shipping", { freeAbove: paise(fd, "freeAbove"), flat: paise(fd, "flat") });
      break;
    case "print":
      await saveSetting("print", {
        ...s.print,
        setupFee: paise(fd, "setupFee"),
        machineRate: paise(fd, "machineRate"),
        minOrder: paise(fd, "minOrder"),
        turnaround: str(fd, "turnaround"),
        bed: { x: int(fd, "bedX", 256), y: int(fd, "bedY", 256), z: int(fd, "bedZ", 256) },
      });
      break;
    default:
      throw new Error("Unknown section");
  }
  done("/admin/content");
}

export async function saveMaterial(fd: FormData) {
  await assertAdmin();
  const id = opt(fd, "id");
  const data = {
    code: str(fd, "code").toUpperCase(),
    name: str(fd, "name"),
    description: str(fd, "description"),
    density: parseFloat(str(fd, "density")) || 1.24,
    pricePerG: paise(fd, "pricePerG"),
    colors: JSON.stringify(str(fd, "colors").split(",").map((c) => c.trim()).filter(Boolean)),
    active: bool(fd, "active"),
    sortOrder: int(fd, "sortOrder"),
  };
  if (id) await db.printMaterial.update({ where: { id }, data });
  else await db.printMaterial.create({ data });
  done("/admin/content");
}
