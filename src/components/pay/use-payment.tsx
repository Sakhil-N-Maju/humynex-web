"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Flask } from "@phosphor-icons/react";
import { confirmRazorpay, confirmTestPayment, reportPaymentFailed, startPayment } from "@/app/actions/payments";
import type { PaymentIntent, PayKind } from "@/lib/payments";
import { formatINR } from "@/lib/money";
import { toast } from "@/components/ui/toaster";

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayCtor = new (opts: Record<string, unknown>) => { open: () => void; on: (ev: string, cb: (r: unknown) => void) => void };

function loadRazorpay(): Promise<RazorpayCtor> {
  const w = window as unknown as { Razorpay?: RazorpayCtor };
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => (w.Razorpay ? resolve(w.Razorpay) : reject(new Error("Razorpay failed to load")));
    s.onerror = () => reject(new Error("Couldn't reach the payment gateway. Check your connection."));
    document.body.appendChild(s);
  });
}

/**
 * Starts payment for an order, rental booking or print job, then sends the
 * customer to the confirmation page once the server has verified it.
 */
export function usePayment() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [testIntent, setTestIntent] = useState<PaymentIntent | null>(null);

  const done = useCallback(
    (kind: PayKind, refId: string) => {
      router.push(`/checkout/success?kind=${kind}&id=${refId}`);
      // points and stock changed on the server; re-render shared layouts (header balance)
      router.refresh();
    },
    [router],
  );

  const pay = useCallback(
    async (kind: PayKind, refId: string) => {
      setBusy(true);
      const res = await startPayment(kind, refId);
      if (!res.ok) {
        toast.bad(res.error);
        setBusy(false);
        return;
      }
      const intent = res.data;
      if (intent.provider === "test") {
        setTestIntent(intent);
        return;
      }
      try {
        const Razorpay = await loadRazorpay();
        const rzp = new Razorpay({
          key: intent.keyId,
          amount: intent.amount,
          currency: intent.currency,
          order_id: intent.providerOrderId,
          name: "Humynex Robotics",
          description: intent.description,
          image: "/brand/logo-mark.png",
          prefill: intent.prefill,
          notes: { reference: intent.reference },
          theme: { color: "#1E90FF" },
          handler: async (r: RazorpayResponse) => {
            const v = await confirmRazorpay(r);
            if (v.ok) done(v.data.kind, v.data.refId);
            else {
              toast.bad(v.error);
              setBusy(false);
            }
          },
          modal: { ondismiss: () => setBusy(false) },
        });
        rzp.on("payment.failed", () => {
          reportPaymentFailed(intent.providerOrderId);
          toast.bad("The payment didn't go through. Nothing was charged. Please try again.");
          setBusy(false);
        });
        rzp.open();
      } catch (e) {
        toast.bad(e instanceof Error ? e.message : "Couldn't open the payment window.");
        setBusy(false);
      }
    },
    [done],
  );

  const dialog = (
    <TestPayDialog
      intent={testIntent}
      onClose={() => {
        setTestIntent(null);
        setBusy(false);
      }}
      onResult={async (outcome) => {
        if (!testIntent) return;
        const r = await confirmTestPayment(testIntent.providerOrderId, outcome);
        setTestIntent(null);
        if (r.ok) done(r.data.kind, r.data.refId);
        else {
          toast.bad(r.error);
          setBusy(false);
        }
      }}
    />
  );

  return { pay, busy, dialog };
}

function TestPayDialog({
  intent,
  onClose,
  onResult,
}: {
  intent: PaymentIntent | null;
  onClose: () => void;
  onResult: (o: "success" | "failure") => Promise<void>;
}) {
  const [working, setWorking] = useState(false);
  return (
    <AnimatePresence>
      {intent && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="test-pay-title"
            initial={{ y: 20, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="surface w-full max-w-md bg-ink-2 p-6"
          >
            <div className="flex items-center gap-3 text-warn">
              <Flask size={22} weight="duotone" />
              <h2 id="test-pay-title" className="font-semibold">Test payment mode</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-fg-2">
              Razorpay keys aren&apos;t configured on this server, so this is a <strong className="text-fg">simulated payment</strong>. No money will be charged. This mode is switched off automatically in production.
            </p>
            <dl className="mt-5 space-y-1 rounded-[4px] bg-ink p-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-fg-3">For</dt>
                <dd>{intent.description}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-fg-3">Amount</dt>
                <dd className="font-mono">{formatINR(intent.amount)}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="btn btn-primary"
                disabled={working}
                onClick={async () => {
                  setWorking(true);
                  await onResult("success");
                  setWorking(false);
                }}
              >
                Simulate success
              </button>
              <button
                className="btn btn-ghost"
                disabled={working}
                onClick={async () => {
                  setWorking(true);
                  await onResult("failure");
                  setWorking(false);
                }}
              >
                Simulate failure
              </button>
              <button className="btn btn-sm ml-auto text-fg-3 hover:text-fg" onClick={onClose} disabled={working}>
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
