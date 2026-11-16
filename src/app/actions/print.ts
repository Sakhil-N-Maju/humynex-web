"use server";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { analyzeMesh, MAX_UPLOAD_BYTES, MeshError } from "@/lib/mesh";
import { estimatePrint } from "@/lib/print-pricing";
import { evaluateCoupon } from "@/lib/coupons";
import { refNumber } from "@/lib/ids";
import { getObject, putObject, signedUploadUrl } from "@/lib/storage";

// keys we hand out for direct uploads; anything else is rejected
const KEY_RE = /^incoming\/\d{13}-[a-f0-9]{12}\.(stl|obj)$/;

/**
 * Step 1 for big files on the live site: hand the browser a one-time link to
 * upload the model straight to private storage (the site itself only accepts
 * small requests). Returns nulls locally, where the file is posted directly.
 */
export async function startPrintUpload(fileName: string, size: number): Promise<{ ok: true; key: string | null; url: string | null } | { ok: false; error: string }> {
  const ext = fileName.toLowerCase().split(".").pop();
  if (ext !== "stl" && ext !== "obj") return { ok: false, error: "Upload an .stl or .obj file." };
  if (!(size > 0) || size > MAX_UPLOAD_BYTES) return { ok: false, error: "That file is over 50 MB. Email it to us and we'll quote it by hand." };
  const key = `incoming/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const url = await signedUploadUrl("prints", key);
  return url ? { ok: true, key, url } : { ok: true, key: null, url: null };
}

const schema = z.object({
  material: z.string().min(1),
  color: z.string().min(1),
  infill: z.coerce.number().int().min(5).max(100),
  quality: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(50),
  units: z.enum(["mm", "in"]),
  name: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,15}$/, "Enter a valid phone number."),
  notes: z.string().trim().max(1000).optional(),
  coupon: z.string().trim().optional(),
});

export type PrintJobResult =
  | { ok: true; jobId: string; total: number; payable: boolean; needsReview: boolean }
  | { ok: false; error?: string; fieldErrors?: Record<string, string> };

/**
 * Saves a print job. The file is re-analysed and re-priced here, so the price
 * the customer pays never depends on numbers sent from the browser.
 */
export async function createPrintJob(form: FormData): Promise<PrintJobResult> {
  // The model arrives either inside the form (local) or already in storage (live site).
  const file = form.get("file");
  const storedKey = String(form.get("storedKey") ?? "");
  const fileName = file instanceof File ? file.name : String(form.get("fileName") ?? "");
  let buf: ArrayBuffer;
  let key: string;
  if (storedKey) {
    if (!KEY_RE.test(storedKey)) return { ok: false, error: "Upload your file again." };
    const data = await getObject("prints", storedKey);
    if (!data) return { ok: false, error: "We didn't receive your file. Upload it again." };
    if (data.byteLength > MAX_UPLOAD_BYTES) return { ok: false, error: "That file is over 50 MB. Email it to us and we'll quote it by hand." };
    buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    key = storedKey;
  } else {
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Attach your STL or OBJ file." };
    if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "That file is over 50 MB. Email it to us and we'll quote it by hand." };
    buf = await file.arrayBuffer();
    key = "";
  }
  const ext = fileName.toLowerCase().split(".").pop();
  if (ext !== "stl" && ext !== "obj") return { ok: false, error: "Upload an .stl or .obj file." };

  const parsed = schema.safeParse(Object.fromEntries([...form.entries()].filter(([k]) => !["file", "storedKey", "fileName"].includes(k))));
  if (!parsed.success) {
    return { ok: false, fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  }
  const d = parsed.data;

  let stats;
  try {
    stats = analyzeMesh(fileName, buf);
  } catch (e) {
    return { ok: false, error: e instanceof MeshError ? e.message : "We couldn't read that model." };
  }

  const material = await db.printMaterial.findUnique({ where: { code: d.material } });
  if (!material || !material.active) return { ok: false, error: "Pick a material." };
  const colors: string[] = JSON.parse(material.colors);
  if (!colors.includes(d.color)) return { ok: false, error: "Pick a colour available for that material." };

  const cfg = await getSetting("print");
  if (!cfg.qualities[d.quality]) return { ok: false, error: "Pick a print quality." };
  const scale = d.units === "in" ? 25.4 : 1;
  const size = { x: stats.size.x * scale, y: stats.size.y * scale, z: stats.size.z * scale };
  const q = estimatePrint(
    { volumeMm3: stats.volume * scale ** 3, size, material, infill: d.infill, quality: d.quality, quantity: d.quantity },
    cfg,
  );

  let total = q.total;
  let couponNote: string | null = null;
  if (d.coupon) {
    const user = await getUser();
    const res = await evaluateCoupon(d.coupon, "PRINT", q.total, !!user);
    if (!res.ok) return { ok: false, error: res.error };
    total = q.total - res.discount;
    couponNote = `${res.code}: -${res.discount}`;
  }

  // tiny or enormous results usually mean the wrong unit; flag for a human check
  const tooSmall = Math.max(size.x, size.y, size.z) < 2;
  const needsReview = !q.fitsBed || tooSmall;

  const stored = key || (await putObject("prints", `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`, buf, "application/octet-stream"));

  const user = await getUser();
  const job = await db.printJob.create({
    data: {
      number: refNumber("PRT"),
      userId: user?.id ?? null,
      fileName: fileName.slice(0, 180),
      filePath: stored,
      fileSize: buf.byteLength,
      units: d.units,
      volumeCm3: Math.round((stats.volume * scale ** 3) / 10) / 100,
      sizeX: Math.round(size.x * 10) / 10,
      sizeY: Math.round(size.y * 10) / 10,
      sizeZ: Math.round(size.z * 10) / 10,
      material: material.code,
      color: d.color,
      infill: d.infill,
      quality: d.quality,
      quantity: d.quantity,
      grams: q.grams,
      hours: q.hours,
      estimate: total,
      breakdown: JSON.stringify({ ...q, coupon: couponNote }),
      needsReview,
      name: d.name,
      email: d.email,
      phone: d.phone,
      notes: d.notes || null,
      status: needsReview ? "QUOTED" : "PENDING_PAYMENT",
    },
  });

  return { ok: true, jobId: job.id, total, payable: !needsReview, needsReview };
}
