import type { Metadata } from "next";
import { getSetting } from "@/lib/settings";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

// DRAFT: written to match how this site actually handles data. Have it reviewed
// by a lawyer (DPDP Act 2023) before launch.
export default async function PrivacyPage() {
  const c = await getSetting("contact");
  return (
    <article className="mx-auto max-w-[760px] px-4 pt-12 md:px-8">
      <h1 className="display-wide text-4xl md:text-5xl">Privacy policy</h1>
      <div className="mt-10 space-y-8 leading-relaxed text-fg-2 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-fg">
        <section>
          <h2>What we collect</h2>
          <p>Your name, email, phone number and delivery address when you order, book a rental, request a 3D print or contact us. If you create an account, we store a securely hashed password and your reward points history. When you upload a 3D model, we store the file to print it.</p>
        </section>
        <section>
          <h2>Payments</h2>
          <p>Payments are processed by Razorpay. Card, UPI and bank details go directly to Razorpay and never reach our servers. We keep a record of the payment reference and amount.</p>
        </section>
        <section>
          <h2>How we use it</h2>
          <p>Only to fulfil your order, rental or print job, contact you about it, run the rewards programme, and answer your messages. We do not sell your data or share it with advertisers.</p>
        </section>
        <section>
          <h2>3D model files</h2>
          <p>Uploaded models are stored outside the public website and are only accessed by our print team. We delete files 90 days after a job is completed, or sooner on request.</p>
        </section>
        <section>
          <h2>Cookies</h2>
          <p>We use one essential cookie to keep you signed in, and your browser&apos;s local storage to remember your cart and whether you hid the helper bots. We do not use advertising or tracking cookies.</p>
        </section>
        <section>
          <h2>Your rights</h2>
          <p>You can ask us to see, correct or delete your personal data. Email <a className="text-volt-hi" href={`mailto:${c.email}`}>{c.email}</a> and we&apos;ll respond within 30 days.</p>
        </section>
        <p className="text-sm text-fg-3">Humynex Robotics, {c.address.join(", ")}.</p>
      </div>
    </article>
  );
}
