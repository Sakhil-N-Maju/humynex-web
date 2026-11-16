import "server-only";
import { randomBytes } from "node:crypto";
import { mediaUrl, putObject } from "./storage";

// Admin photo uploads. Stored in the public "media" bucket (or /public/uploads
// locally); the returned URL is what gets saved on the product, rental, etc.

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
// Vercel caps a request at about 4.5 MB, so photos stay under 4 MB.
const MAX = 4 * 1024 * 1024;

export async function saveImage(file: FormDataEntryValue | null, folder: string): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const ext = TYPES[file.type];
  if (!ext) throw new Error("Images must be JPG, PNG, WebP or AVIF.");
  if (file.size > MAX) throw new Error("Images must be under 4 MB. Resize it and try again.");
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "") || "misc";
  const key = `${safeFolder}/${Date.now()}-${randomBytes(5).toString("hex")}.${ext}`;
  await putObject("media", key, await file.arrayBuffer(), file.type);
  return mediaUrl(key);
}
