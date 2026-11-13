"use client";

import { usePayment } from "@/components/pay/use-payment";
import type { PayKind } from "@/lib/payments";

export function PayNow({ kind, id }: { kind: PayKind; id: string }) {
  const { pay, busy, dialog } = usePayment();
  return (
    <>
      <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => pay(kind, id)}>
        Pay now
      </button>
      {dialog}
    </>
  );
}
