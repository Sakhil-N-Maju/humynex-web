import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { formatINR } from "@/lib/money";
import { LegalPage, LegalContact } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Shipping and delivery", alternates: { canonical: "/shipping-policy" } };

// DRAFT for the company to review. Delivery times are typical courier times;
// adjust once the courier partner is fixed.
export default async function ShippingPolicyPage() {
  const s = await getSettings();
  const c = s.contact;
  return (
    <LegalPage
      path="/shipping-policy"
      title="Shipping and delivery"
      intro="Where we ship, how fast, what it costs, and how robot rentals reach your event."
    >
      <section>
        <h2>Where we ship</h2>
        <p>Parts, kits and 3D prints ship anywhere in India that our courier partners serve. If your PIN code can’t be served, we’ll tell you before dispatch and refund in full. We don’t ship outside India yet.</p>
      </section>

      <section>
        <h2>Shipping charges</h2>
        <ul>
          <li>Orders of <strong>{formatINR(s.shipping.freeAbove)} or more</strong> (after offers): free shipping.</li>
          <li>Orders below that: a flat <strong>{formatINR(s.shipping.flat)}</strong>.</li>
        </ul>
        <p>The exact charge is shown at checkout before you pay.</p>
      </section>

      <section>
        <h2>How long it takes</h2>
        <ul>
          <li><strong>Parts and kits:</strong> packed and dispatched within 2 working days of payment.</li>
          <li><strong>3D prints:</strong> ready in {s.print.turnaround.toLowerCase()}, then dispatched.</li>
          <li><strong>Delivery:</strong> usually 2 to 4 working days within Kerala, and 4 to 8 working days elsewhere in India, after dispatch.</li>
        </ul>
        <p>Working days are Monday to Saturday, excluding public holidays. Remote areas, bad weather and festivals can add a few days.</p>
      </section>

      <section>
        <h2>Tracking</h2>
        <p>When your order ships, we email you the courier name and tracking number. You can also see your orders under My account.</p>
      </section>

      <section>
        <h2>Address and delivery attempts</h2>
        <p>Check your address and phone number at checkout; the courier may call before delivering. If a parcel comes back to us because the address was wrong or nobody accepted it, we’ll reship it once you pay the extra shipping, or refund the order minus the shipping cost.</p>
      </section>

      <section>
        <h2>Damaged in transit</h2>
        <p>If the box looks damaged when it arrives, note it with the courier if you can, and tell us within 48 hours with photos. We’ll replace or refund the affected items, as set out in our refund policy.</p>
      </section>

      <section>
        <h2>Robot rentals</h2>
        <p>Rentals are not shipped. Our team brings the robot to your venue, sets it up, runs it with a trained operator and takes it back afterwards. Transport is included for venues within 60 km of Kalady. Farther venues are welcome and quoted separately for travel.</p>
      </section>

      <section>
        <h2>Collect from our lab</h2>
        <p>You can collect parts and prints from our lab in Kalady at no charge. Choose this when you contact us, and we’ll tell you when it’s ready.</p>
      </section>

      <LegalContact email={c.email} phone={c.phones[0] ?? ""} address={c.address} />
    </LegalPage>
  );
}
