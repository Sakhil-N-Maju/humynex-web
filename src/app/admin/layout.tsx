import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logout } from "@/app/actions/auth";
import { AdminNav } from "./nav";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const [unread, review] = await Promise.all([
    db.contactMessage.count({ where: { read: false } }),
    db.printJob.count({ where: { status: "QUOTED" } }),
  ]);

  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-ink-2 lg:sticky lg:top-0 lg:h-[100dvh] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image src="/brand/logo-mark-160.webp" alt="" width={36} height={24} />
            <span className="display text-sm">HUMYNEX ADMIN</span>
          </Link>
          <Link href="/" className="text-xs text-fg-3 hover:text-volt-hi lg:mt-2 lg:block">View site</Link>
        </div>
        <AdminNav badges={{ "/admin/messages": unread, "/admin/prints": review }} />
        <div className="hidden border-t border-line px-5 py-4 text-xs text-fg-3 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
          <p className="truncate">{user.email}</p>
          <form action={logout}>
            <button className="mt-1 hover:text-fg">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-8 md:px-10">{children}</main>
    </div>
  );
}
