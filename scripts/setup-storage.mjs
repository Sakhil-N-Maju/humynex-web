// Creates the two Supabase Storage buckets the site uses. Safe to run again.
//   npm run storage:setup
const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first.");
  process.exit(1);
}
const buckets = [
  // public photos: images only, up to 4 MB
  { id: "media", name: "media", public: true, file_size_limit: 4 * 1024 * 1024, allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/avif"] },
  // private customer 3D models, up to 50 MB
  { id: "prints", name: "prints", public: false, file_size_limit: 50 * 1024 * 1024 },
];
for (const b of buckets) {
  const res = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify(b),
  });
  const body = await res.text();
  if (res.ok) console.log(`created bucket "${b.id}"`);
  else if (/already exists|Duplicate/i.test(body)) console.log(`bucket "${b.id}" already exists`);
  else {
    console.error(`bucket "${b.id}" failed (${res.status}): ${body}`);
    process.exitCode = 1;
  }
}
