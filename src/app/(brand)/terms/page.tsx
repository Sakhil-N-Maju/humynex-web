import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { formatINR } from "@/lib/money";
import { LEGAL } from "@/lib/legal";
import { LegalPage, LegalContact } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Terms of service", alternates: { canonical: "/terms" } };

// DRAFT for the company to review with a lawyer before launch.
export default async function TermsPage() {
  const s = await getSettings();
  const c = s.contact;
  return (
    <LegalPage
      path="/terms"
      title="Terms of service"
      intro="The agreement between you and us when you use this site, buy parts, rent a robot or order a 3D print."
    >
      <section>
        <h2>About these terms</h2>
        <p>
          This site is run by {LEGAL.legalName}, trading as {LEGAL.brand} (“we”, “us”). By using the site or placing an order, booking or
          enquiry, you agree to these terms, our <Link href="/privacy">privacy policy</Link>, our{" "}
          <Link href="/refund-policy">refund and cancellation policy</Link> and our <Link href="/shipping-policy">shipping policy</Link>.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <p>Give accurate details and keep your sign-in secure; you’re responsible for activity on your account. You can sign in with Google or with an email and password. We may suspend accounts used for fraud or abuse.</p>
      </section>

      <section>
        <h2>Prices and payment</h2>
        <p>Prices are in Indian rupees and include GST unless shown otherwise. Payment is taken online through Razorpay (UPI, cards, net banking and wallets). An order is confirmed once payment succeeds. If a price or stock level on the site is wrong, we’ll contact you before dispatch, and you can accept the correct price or cancel for a full refund.</p>
      </section>

      <section>
        <h2>Electronics and robot parts</h2>
        <p>Parts are sold for hobby, education, prototyping and professional development. Follow the manufacturer’s datasheet and safe practice, especially with batteries, high current and mains power. Parts are not certified for medical, automotive, aviation or other safety-critical use. Warranty and returns are covered in our <Link href="/refund-policy">refund policy</Link>.</p>
      </section>

      <section>
        <h2>Robot rentals</h2>
        <ul>
          <li>A rental starts as an enquiry. It’s confirmed only when we’ve called you to agree dates, venue, timings and price, and the rent and refundable deposit are paid.</li>
          <li>A trained {LEGAL.brand} operator runs the robot for the whole booking. Robots and costumes are not left unattended with guests.</li>
          <li>You provide safe access to the venue, a level operating area, a power point if needed, and reasonable crowd management.</li>
          <li>Follow the operator’s instructions. Guests must not ride, climb on, or interfere with the robot. The operator can pause or end a session if it becomes unsafe.</li>
          <li>Standard rentals cover venues within 60 km of Kalady; farther venues are quoted separately.</li>
          <li>You’re responsible for damage beyond normal use caused by you or your guests, up to the repair or replacement cost, which may be taken from the deposit.</li>
        </ul>
      </section>

      <section>
        <h2>3D printing</h2>
        <ul>
          <li>You confirm you own, or have permission to print, every model you upload, and that it doesn’t infringe anyone’s rights.</li>
          <li>We won’t print weapons, weapon parts, or anything unlawful, and may refuse any job without giving a reason (with a full refund if paid).</li>
          <li>Online prices are final for parts that fit our print bed. Larger or unusual parts are checked by an engineer, who confirms the price before you pay.</li>
          <li>3D printing has normal tolerances (usually around ±0.2 mm) and visible layer lines. Parts that need tighter tolerances or specific strength should be discussed with us first.</li>
        </ul>
      </section>

      <section>
        <h2>Reward points</h2>
        <p>New accounts get {s.rewards.signupBonus} points, and you earn {s.rewards.pointsPer100} points for every ₹100 paid. One point is worth ₹1 off, on up to {s.rewards.maxRedeemPct}% of an order. Points have no cash value, can’t be transferred, and are returned if an order using them is cancelled. We may change the programme with 30 days’ notice on this page.</p>
      </section>

      <section>
        <h2>Shipping, refunds and cancellations</h2>
        <p>
          Parts ship within 2 working days, free on orders of {formatINR(s.shipping.freeAbove)} or more, otherwise {formatINR(s.shipping.flat)}. Full details are in
          our <Link href="/shipping-policy">shipping policy</Link> and <Link href="/refund-policy">refund and cancellation policy</Link>.
        </p>
      </section>

      <section>
        <h2>Content and intellectual property</h2>
        <p>The site’s text, design, photos, logo and the {LEGAL.brand} name belong to us or our licensors. You may share links, but not copy the site or its content for commercial use without written permission. Third-party product names and brands belong to their owners.</p>
      </section>

      <section>
        <h2>Our responsibility</h2>
        <p>We take care to describe products and services accurately and to deliver them as promised. To the extent the law allows, our total liability for any claim about an order, rental or print is limited to the amount you paid for it, and we’re not liable for indirect losses such as lost profits or missed events caused by things outside our reasonable control (for example, weather, power cuts, venue restrictions or courier delays). Nothing here limits your rights under the Consumer Protection Act, 2019.</p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>These terms are governed by the laws of India. Any dispute is subject to the courts in {LEGAL.jurisdiction}, without affecting your right to approach a consumer commission.</p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>We may update these terms; the date at the top shows the latest version. Orders and bookings follow the terms in place when they were made.</p>
      </section>

      <LegalContact email={c.email} phone={c.phones[0] ?? ""} address={c.address} />
    </LegalPage>
  );
}
