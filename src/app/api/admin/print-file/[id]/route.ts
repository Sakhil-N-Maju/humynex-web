import path from "node:path";
import { NextResponse } from "next/server";
import { getUser, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getObject } from "@/lib/storage";

/** Admin-only download of a customer's uploaded model. Files live in private storage, never in /public. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user || !(await isAdmin(user))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { id } = await params;
  const job = await db.printJob.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // older local jobs stored just a file name; newer ones store the storage key
  const key = job.filePath.includes("/") ? job.filePath : path.basename(job.filePath);
  const data = await getObject("prints", key);
  if (!data) return NextResponse.json({ error: "File missing from storage" }, { status: 410 });
  const safeName = job.fileName.replace(/[^\w.\- ]/g, "_");
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${job.number}-${safeName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
