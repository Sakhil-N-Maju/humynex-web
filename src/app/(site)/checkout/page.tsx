import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { CheckoutClient } from "./checkout-client";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const user = await getUser();
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-12 md:px-8">
      <h1 className="display-wide text-4xl md:text-5xl">Checkout</h1>
      <CheckoutClient user={user ? { name: user.name, email: user.email, phone: user.phone ?? "", points: user.points } : null} />
    </div>
  );
}
