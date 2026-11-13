import type { Metadata } from "next";
import { getSetting } from "@/lib/settings";
import { formatINR } from "@/lib/money";

export const metadata: Metadata = { title: "Terms, shipping and refunds", alternates: { canonical: "/terms" } };

// DRAFT: reflects how the site works today. Have it reviewed by a lawyer before launch.
export default async function TermsPage() {
  const [c, shipping, rewards] = await Promise.all([getSetting("contact"), getSetting("shipping"), getSetting("rewards")]);
  return (
    <article className="mx-auto max-w-[760px] px-4 pt-12 md:px-8">
      <h1 className="display-wide text-4xl md:text-5xl">Terms, shipping and refunds</h1>
      <div className="mt-10 space-y-8 leading-relaxed text-fg-2 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-fg">
        <section>
          <h2>Parts orders</h2>
          <p>Prices include GST. Orders ship within 2 working days. Shipping is free on orders of {formatINR(shipping.freeAbove)} or more after offers, otherwise {formatINR(shipping.flat)}. If a part arrives faulty, tell us within 7 days and we&apos;ll replace it. Parts that have been soldered or modified can&apos;t be returned unless they were faulty on arrival.</p>
        </section>
        <section>
          <h2>Robot rentals</h2>
          <p>A booking is confirmed once the rent and refundable deposit are paid. Our operator runs the robot at your event. The deposit is refunded within 3 working days of return, minus the cost of any damage beyond normal use. Cancel 7 or more days before the start date for a full refund. Cancellations within 7 days are refunded except for one day&apos;s rent.</p>
        </section>
        <section>
          <h2>3D printing</h2>
          <p>Online estimates are final for parts that fit our print bed. Because every print is made to order, paid print jobs can&apos;t be cancelled once printing has started. If a print has a defect caused by us, we&apos;ll reprint it free. You confirm you have the right to print any model you upload.</p>
        </section>
        <section>
          <h2>Reward points</h2>
          <p>Points have no cash value and can&apos;t be transferred. One point is worth ₹1 off, on up to {rewards.maxRedeemPct}% of an order. Points used on an order that is cancelled are returned to your account. We may change the programme with 30 days&apos; notice on this page.</p>
        </section>
        <section>
          <h2>Contact</h2>
          <p>Humynex Robotics, {c.address.join(", ")}. <a className="text-volt-hi" href={`mailto:${c.email}`}>{c.email}</a>, {c.phones[0]}.</p>
        </section>
      </div>
    </article>
  );
}
