import { NextResponse } from "next/server";
import { getUser, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Just enough about the signed-in visitor for the nav. Lets public pages stay static. */
export async function GET() {
  const u = await getUser();
  const user = u ? { name: u.name.split(" ")[0], points: u.points, isAdmin: await isAdmin(u) } : null;
  return NextResponse.json({ user }, { headers: { "Cache-Control": "private, no-store" } });
}
