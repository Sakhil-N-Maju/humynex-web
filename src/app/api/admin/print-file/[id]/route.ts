import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";

/** Admin-only download of a customer's uploaded model. Files never live in /public. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { id } = await params;
  const job = await db.printJob.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const root = path.join(process.cwd(), "storage", "prints");
  const file = path.join(root, path.basename(job.filePath));
  try {
    const data = await readFile(file);
    const safeName = job.fileName.replace(/[^\w.\- ]/g, "_");
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${job.number}-${safeName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing on disk" }, { status: 410 });
  }
}
