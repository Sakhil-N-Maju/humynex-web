import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * File storage. With SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set, files go
 * to Supabase Storage; without them (local development) they go to disk.
 *
 * Buckets (create once with `npm run storage:setup`):
 *   media  - public: product, rental, project and team photos
 *   prints - private: customers' 3D model files, only readable by the server
 */
export type Bucket = "media" | "prints";

const URL_ = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function cloudStorage() {
  return !!(URL_ && KEY);
}

const headers = (extra: Record<string, string> = {}) => ({ Authorization: `Bearer ${KEY}`, apikey: KEY!, ...extra });
const enc = (p: string) => p.split("/").map(encodeURIComponent).join("/");

// local fallbacks: media under /public so Next serves it, prints outside it
const LOCAL: Record<Bucket, string> = {
  media: path.join(process.cwd(), "public", "uploads"),
  prints: path.join(process.cwd(), "storage", "prints"),
};

/** Store a file. Returns the key to save in the database. */
export async function putObject(bucket: Bucket, key: string, body: ArrayBuffer | Buffer, contentType: string) {
  if (!cloudStorage()) {
    const file = path.join(LOCAL[bucket], key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, Buffer.from(body as ArrayBuffer));
    return key;
  }
  const res = await fetch(`${URL_}/storage/v1/object/${bucket}/${enc(key)}`, {
    method: "POST",
    headers: headers({ "Content-Type": contentType, "x-upsert": "false" }),
    body: new Uint8Array(body as ArrayBuffer),
  });
  if (!res.ok) throw new Error(`Storage upload failed (${res.status}): ${await res.text()}`);
  return key;
}

/** Public URL for something in the media bucket. */
export function mediaUrl(key: string) {
  return cloudStorage() ? `${URL_}/storage/v1/object/public/media/${enc(key)}` : `/uploads/${key}`;
}

/** Read a file back on the server (e.g. a customer's model for an admin download). */
export async function getObject(bucket: Bucket, key: string): Promise<Buffer | null> {
  if (!cloudStorage()) {
    try {
      return await readFile(path.join(LOCAL[bucket], path.normalize(key).replace(/^(\.\.[/\\])+/, "")));
    } catch {
      return null;
    }
  }
  const res = await fetch(`${URL_}/storage/v1/object/${bucket}/${enc(key)}`, { headers: headers(), cache: "no-store" });
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`Storage download failed (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * A one-time link the customer's browser can upload a single file to,
 * straight into storage, so big files never pass through the website server.
 */
export async function signedUploadUrl(bucket: Bucket, key: string) {
  if (!cloudStorage()) return null;
  const res = await fetch(`${URL_}/storage/v1/object/upload/sign/${bucket}/${enc(key)}`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: "{}",
  });
  if (!res.ok) throw new Error(`Couldn't create an upload link (${res.status})`);
  const { url } = (await res.json()) as { url: string };
  return `${URL_}/storage/v1${url}`;
}
