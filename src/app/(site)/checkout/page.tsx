import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CheckoutClient } from "./checkout-client";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const user = await getUser();
  // saved address from the account, to fill in the form
  const saved = user
    ? await db.user.findUnique({
        where: { id: user.id },
        select: { addrLine1: true, addrLine2: true, addrCity: true, addrState: true, addrPostal: true },
      })
    : null;
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-12 md:px-8">
      <h1 className="display-wide text-4xl md:text-5xl">Checkout</h1>
      <CheckoutClient
        user={
          user
            ? {
                name: user.name,
                email: user.email,
                phone: user.phone ?? "",
                points: user.points,
                line1: saved?.addrLine1 ?? "",
                line2: saved?.addrLine2 ?? "",
                city: saved?.addrCity ?? "",
                state: saved?.addrState ?? "",
                postal: saved?.addrPostal ?? "",
              }
            : null
        }
      />
    </div>
  );
}
