"use client";

import { useFormStatus } from "react-dom";
import clsx from "clsx";

export function SubmitButton({ children = "Save", className }: { children?: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={clsx("btn btn-primary", className)} disabled={pending}>
      {pending ? "Saving" : children}
    </button>
  );
}

/** A submit button that asks first. Used for deletes and cancellations. */
export function ConfirmButton({ children, message, className }: { children: React.ReactNode; message: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      className={clsx("btn btn-ghost btn-sm hover:!border-bad hover:!bg-bad/5 hover:!text-bad", className)}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
