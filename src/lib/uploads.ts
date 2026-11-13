import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

// Admin image uploads are written to /public/uploads so Next can serve them.
// NOTE for production on Vercel: the filesystem is read-only, so swap this
// function for Vercel Blob, S3 or Cloudinary. It's the only place that changes.

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX = 8 * 1024 * 1024;

export async function saveImage(file: FormDataEntryValue | null, folder: string): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const ext = TYPES[file.type];
  if (!ext) throw new Error("Images must be JPG, PNG, WebP or AVIF.");
  if (file.size > MAX) throw new Error("Images must be under 8 MB.");
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "");
  const dir = path.join(process.cwd(), "public", "uploads", safeFolder);
  await mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${randomBytes(5).toString("hex")}.${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${safeFolder}/${name}`;
}
