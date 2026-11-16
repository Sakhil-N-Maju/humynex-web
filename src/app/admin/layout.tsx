import type { Metadata } from "next";
import { SignOut } from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/auth";
import { ADMIN_PREVIEW, DEMO_READONLY } from "@/lib/admin-access";
import { db } from "@/lib/db";
import { logout } from "@/app/actions/auth";
import { AdminSidebar } from "./nav";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const [unread, review, enquiries] = await Promise.all([
    db.contactMessage.count({ where: { read: false } }),
    db.printJob.count({ where: { status: "QUOTED" } }),
    db.rentalBooking.count({ where: { status: "ENQUIRY" } }),
  ]);

  const account = ADMIN_PREVIEW ? (
    <div className="rounded-[18px] border border-white/10 p-4">
      <p className="flex items-center gap-2 font-medium text-white">
        <span className="size-2 rounded-full bg-[#1E90FF]" aria-hidden="true" />
        {DEMO_READONLY ? "Demo preview" : "Preview mode"}
      </p>
      <p className="mt-1.5 leading-relaxed text-white/50">
        {DEMO_READONLY
          ? "Sign-in is off and changes aren't saved on this demo."
          : "Sign-in is off while the site is in development. Admins will sign in with Google."}
      </p>
    </div>
  ) : (
    <div className="text-white/50">
      <p className="truncate">{user.email}</p>
      <form action={logout}>
        <button className="mt-1.5 inline-flex items-center gap-1.5 font-medium text-white/80 transition-colors hover:text-white">
          <SignOut size={14} /> Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[#050816] text-white lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:flex-col">
        <AdminSidebar badges={{ "/admin/messages": unread, "/admin/prints": review, "/admin/bookings": enquiries }} account={account} />
      </aside>

      <main className="min-w-0 p-2 pt-0 md:p-3 lg:pl-0">
        <div className="admin-light min-h-[calc(100dvh-1.5rem)] rounded-[28px] bg-white px-5 py-8 md:rounded-[36px] md:px-10 md:py-12 xl:px-14">
          {children}
        </div>
      </main>
    </div>
  );
}
