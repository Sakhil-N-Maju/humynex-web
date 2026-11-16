import type { Metadata } from "next";
import { getSetting } from "@/lib/settings";
import { LEGAL } from "@/lib/legal";
import { LegalPage, LegalContact } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

// DRAFT for the company to review with a lawyer (Digital Personal Data Protection Act 2023).
export default async function PrivacyPage() {
  const c = await getSetting("contact");
  return (
    <LegalPage
      path="/privacy"
      title="Privacy policy"
      intro="What personal data we collect, why, who sees it, how long we keep it, and how you stay in control of it."
    >
      <section>
        <h2>Who we are</h2>
        <p>
          This website is run by {LEGAL.legalName}, trading as {LEGAL.brand}, {c.address.join(", ")}. We decide how your personal data is used
          on this site, which makes us the “data fiduciary” under India’s Digital Personal Data Protection Act, 2023.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <h3>When you create an account or sign in</h3>
        <p>Your name and email. If you sign in with Google, we receive only your name and verified email from Google, never your Google password. If you use an email and password, we store the password as a one-way hash we can’t read.</p>
        <h3>When you order, enquire or book</h3>
        <p>Your name, phone number and email; a delivery address for parts orders; the event venue, dates and notes for robot rentals; and for 3D printing, the model file you upload and your print choices.</p>
        <h3>When you pay</h3>
        <p>Payments are handled by Razorpay. Your card, UPI and bank details go straight to Razorpay and never reach us. We keep the payment reference, amount and status.</p>
        <h3>When you contact us</h3>
        <p>What you write to us, with the name, email and phone number you give.</p>
        <h3>Automatically</h3>
        <p>Basic technical logs (IP address, browser, pages requested and errors) kept by our hosting provider to run and secure the site.</p>
      </section>

      <section>
        <h2>Why we use it</h2>
        <ul>
          <li>To deliver what you asked for: ship your order, plan and run your rental, print your part, answer your message.</li>
          <li>To contact you about it, by phone, email or WhatsApp.</li>
          <li>To run your account and reward points.</li>
          <li>To keep the site secure and prevent fraud.</li>
          <li>To meet legal duties, such as GST invoicing and tax records.</li>
        </ul>
        <p>We don’t sell your data, and we don’t use it for third-party advertising. We’ll only send marketing emails if you opt in, and every one will have an unsubscribe link.</p>
      </section>

      <section>
        <h2>Who we share it with</h2>
        <p>Only the service providers needed to run the site, each bound to use the data only for us:</p>
        <ul>
          <li><strong>Razorpay</strong>, for payments.</li>
          <li><strong>Courier partners</strong>, who get your name, phone and address to deliver parts.</li>
          <li><strong>Hosting and storage</strong> (Vercel for the website; Supabase for the database and files, in its Mumbai region).</li>
          <li><strong>Google</strong>, only if you choose to sign in with Google.</li>
          <li><strong>Email delivery</strong>, to send order and booking messages.</li>
        </ul>
        <p>We may also share data when the law requires it, for example with tax authorities or in response to a valid legal order.</p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <ul>
          <li><strong>Account details:</strong> until you ask us to delete your account.</li>
          <li><strong>Orders, payments and invoices:</strong> as long as Indian tax and accounting laws require (currently up to 8 years).</li>
          <li><strong>3D model files:</strong> deleted 90 days after the job is completed, or sooner if you ask.</li>
          <li><strong>Messages and enquiries:</strong> 2 years, then deleted.</li>
        </ul>
      </section>

      <section>
        <h2>Cookies and local storage</h2>
        <p>We use only what the site needs to work: one cookie that keeps you signed in, a short-lived cookie that protects Google sign-in, and your browser’s local storage to remember your cart. No advertising or tracking cookies.</p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>Under the DPDP Act you can:</p>
        <ul>
          <li>ask what personal data we hold about you and how it’s used;</li>
          <li>correct or update it;</li>
          <li>ask us to delete it, and withdraw consent (we’ll still keep what tax law requires);</li>
          <li>nominate someone to act for you;</li>
          <li>raise a grievance with us, and if you’re not satisfied, with the Data Protection Board of India.</li>
        </ul>
        <p>Email <a href={`mailto:${c.email}`}>{c.email}</a> from the address on your account. We’ll reply within 30 days.</p>
      </section>

      <section>
        <h2>Security</h2>
        <p>Data is encrypted in transit, payments never touch our servers, uploaded model files are kept in private storage that only our team can open, and admin access is limited to named company accounts. No system is perfectly secure; if a breach affects you, we’ll tell you and the Data Protection Board as the law requires.</p>
      </section>

      <section>
        <h2>Children</h2>
        <p>Accounts and purchases are for people 18 or older. If you’re under 18, a parent or guardian must place the order or booking for you.</p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>If we change this policy, we’ll update the date at the top of this page, and tell account holders by email about significant changes.</p>
      </section>

      <LegalContact email={c.email} phone={c.phones[0] ?? ""} address={c.address} />
    </LegalPage>
  );
}
