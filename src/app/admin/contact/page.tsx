import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { PageHead, Flash, F } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminContact({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [s, unread] = await Promise.all([getSettings(), db.contactMessage.count({ where: { read: false } })]);
  const c = s.contact;

  return (
    <div className="max-w-[960px]">
      <PageHead eyebrow="Website · Contact" title="Contact details" sub="Shown on the Contact page, in the footer and on legal pages." />
      <Flash sp={sp} />

      <Link
        href="/admin/messages"
        className="group mb-8 flex items-center justify-between gap-4 rounded-[24px] bg-[#050816] px-6 py-5 text-white transition-colors hover:bg-[#0a1430]"
      >
        <span>
          <span className="display block text-lg">Messages and enquiries</span>
          <span className="text-sm text-white/60">
            {unread ? `${unread} unread` : "All caught up"}. Contact form and rental enquiries land here.
          </span>
        </span>
        <ArrowUpRight size={20} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>

      <SettingsForm section="contact" back="/admin/contact" title="Contact details" sub="Social links only appear in the footer once they have a URL.">
        <div className="grid gap-5 sm:grid-cols-2">
          <F label="Email" name="email"><input id="email" name="email" type="email" defaultValue={c.email} className="input" /></F>
          <F label="Careers email" name="careersEmail"><input id="careersEmail" name="careersEmail" type="email" defaultValue={c.careersEmail} className="input" /></F>
          <F label="Phone numbers" name="phones" hint="One per line. The first one is used on buttons.">
            <textarea id="phones" name="phones" rows={3} defaultValue={c.phones.join("\n")} className="input font-mono" />
          </F>
          <F label="Address" name="address" hint="One line per row.">
            <textarea id="address" name="address" rows={3} defaultValue={c.address.join("\n")} className="input" />
          </F>
          <F label="Opening hours" name="hours"><input id="hours" name="hours" defaultValue={c.hours} className="input" /></F>
          <F label="Google Maps link" name="mapsUrl"><input id="mapsUrl" name="mapsUrl" defaultValue={c.mapsUrl} className="input" /></F>
          <F label="Instagram URL" name="instagram"><input id="instagram" name="instagram" defaultValue={c.social.instagram} className="input" /></F>
          <F label="LinkedIn URL" name="linkedin"><input id="linkedin" name="linkedin" defaultValue={c.social.linkedin} className="input" /></F>
          <F label="YouTube URL" name="youtube"><input id="youtube" name="youtube" defaultValue={c.social.youtube} className="input" /></F>
        </div>
      </SettingsForm>
    </div>
  );
}
