import type { Metadata } from "next";
import { getSetting } from "@/lib/settings";
import { LegalPage, LegalContact } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Refunds and cancellations", alternates: { canonical: "/refund-policy" } };

// DRAFT for the company to review. Change-of-mind returns (marked below) are a
// proposal; confirm or remove before launch.
export default async function RefundPolicyPage() {
  const c = await getSetting("contact");
  return (
    <LegalPage
      path="/refund-policy"
      title="Refunds and cancellations"
      intro="How to cancel, return or get a refund for parts, robot rentals and 3D prints, and how long it takes."
    >
      <section>
        <h2>Parts and kits</h2>
        <h3>Cancelling an order</h3>
        <p>You can cancel any time before it’s dispatched, for a full refund. Once dispatched, it can be returned as below.</p>
        <h3>Faulty, damaged or wrong items</h3>
        <p>
          Tell us within <strong>7 days of delivery</strong>, with your order number and photos or a short video of the problem (an unboxing video
          helps for damage in transit). After checking, we’ll replace the item, or refund it if we can’t replace it. We cover return shipping for
          faulty, damaged or wrong items.
        </p>
        <h3>Change of mind</h3>
        <p>Unused items in their original, unopened packaging can be returned within 7 days of delivery. Return shipping is paid by you, and the refund is for the item price.</p>
        <h3>What can’t be returned</h3>
        <ul>
          <li>Parts that have been soldered, wired, modified, flashed with firmware or otherwise used (unless they were faulty on arrival).</li>
          <li>Parts damaged by incorrect wiring, wrong voltage or polarity, or static.</li>
          <li>Batteries that have been charged or used, and cut-to-length items such as wire.</li>
          <li>Items marked “final sale”.</li>
        </ul>
      </section>

      <section>
        <h2>Robot rentals</h2>
        <ul>
          <li><strong>Before confirmation:</strong> an enquiry is free and can be withdrawn any time.</li>
          <li><strong>Cancel 7 or more days before the start date:</strong> full refund of rent and deposit.</li>
          <li><strong>Cancel within 7 days of the start date:</strong> everything is refunded except one day’s rent.</li>
          <li><strong>If we cancel</strong> (for example, the robot is unavailable or unsafe to operate): full refund, or a new date of your choice.</li>
          <li><strong>Venue or weather problems on the day</strong> that stop the robot running safely: we’ll offer another date. If that isn’t possible, we refund everything except one day’s rent, as the robot and operator have already travelled.</li>
          <li><strong>Deposit:</strong> refunded within 3 working days after the robot is returned in good condition. Repair costs for damage beyond normal use are deducted, and we’ll show you how.</li>
        </ul>
      </section>

      <section>
        <h2>3D printing</h2>
        <ul>
          <li><strong>Before printing starts:</strong> cancel for a full refund.</li>
          <li><strong>After printing starts:</strong> prints are made to order, so they can’t be cancelled or returned for a change of mind.</li>
          <li><strong>Defects caused by us</strong> (failed layers, wrong material or colour, wrong size compared with your file): we’ll reprint for free, or refund if we can’t. Report it within 7 days of delivery with photos.</li>
          <li>Problems from the model file itself (wrong units, thin walls, design errors) aren’t treated as defects, but we’re happy to help fix the file.</li>
          <li><strong>Engineer-reviewed jobs</strong> aren’t charged until you approve the confirmed price.</li>
        </ul>
      </section>

      <section>
        <h2>How refunds are paid</h2>
        <p>
          Approved refunds go back to your original payment method through Razorpay. We start them within <strong>2 working days</strong> of approval.
          Your bank usually shows them within <strong>5 to 7 working days</strong> (UPI is often faster). Reward points used on a cancelled order
          are returned to your account, and points earned on it are removed.
        </p>
      </section>

      <section>
        <h2>How to ask for a cancellation or refund</h2>
        <p>
          Email <a href={`mailto:${c.email}`}>{c.email}</a> or call <a href={`tel:${(c.phones[0] ?? "").replace(/\s/g, "")}`}>{c.phones[0]}</a> with your order or booking
          number. We reply within one working day.
        </p>
      </section>

      <LegalContact email={c.email} phone={c.phones[0] ?? ""} address={c.address} />
    </LegalPage>
  );
}
