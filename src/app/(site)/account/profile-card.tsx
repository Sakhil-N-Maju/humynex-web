"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { PencilSimple, Phone, EnvelopeSimple, MapPin } from "@phosphor-icons/react";
import { Field } from "@/components/ui/field";
import { toast } from "@/components/ui/toaster";
import { STATES } from "@/lib/india";
import { updateProfile, type ProfileState } from "@/app/actions/account";

export type Profile = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal: string;
};

/** Contact details and saved delivery address: a summary, edited in place. */
export function ProfileCard({ profile }: { profile: Profile }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, undefined);

  useEffect(() => {
    if (state?.ok) {
      setEditing(false);
      toast.ok("Details saved.");
    } else if (state?.error) toast.bad(state.error);
  }, [state]);

  const err = state?.fieldErrors ?? {};
  const hasAddress = !!profile.line1;

  if (!editing) {
    return (
      <section aria-labelledby="details-title" className="surface mt-10 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="details-title" className="text-lg font-semibold">Your details</h2>
          <button type="button" onClick={() => setEditing(true)} className="btn btn-ghost btn-sm">
            <PencilSimple size={15} /> Edit
          </button>
        </div>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div className="space-y-3 text-sm">
            <p className="font-medium text-fg">{profile.name}</p>
            <p className="flex items-center gap-2 text-fg-2">
              <EnvelopeSimple size={16} className="shrink-0 text-fg-3" /> {profile.email}
            </p>
            <p className="flex items-center gap-2 text-fg-2">
              <Phone size={16} className="shrink-0 text-fg-3" />
              {profile.phone || <button type="button" onClick={() => setEditing(true)} className="text-volt-hi hover:underline">Add your phone number</button>}
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <MapPin size={16} className="mt-0.5 shrink-0 text-fg-3" />
            {hasAddress ? (
              <address className="not-italic leading-relaxed text-fg-2">
                {profile.line1}
                {profile.line2 && <><br />{profile.line2}</>}
                <br />
                {profile.city}, {profile.state} {profile.postal}
              </address>
            ) : (
              <p className="text-fg-2">
                No delivery address saved.{" "}
                <button type="button" onClick={() => setEditing(true)} className="text-volt-hi hover:underline">Add one</button> and checkout
                fills it in for you.
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="details-title" className="surface mt-10 p-6 md:p-8">
      <h2 id="details-title" className="text-lg font-semibold">Your details</h2>
      {/* submitted by hand rather than via `action`, so React doesn't clear
          what was typed when the server sends back a field error */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          startTransition(() => action(data));
        }}
        className="mt-6 space-y-8"
        noValidate
      >
        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 text-sm font-medium text-fg-2">Contact</legend>
          <Field label="Full name" name="name" error={err.name}>
            <input id="name" name="name" defaultValue={profile.name} autoComplete="name" className="input" aria-invalid={!!err.name} />
          </Field>
          <Field label="Phone" name="phone" error={err.phone}>
            <input id="phone" name="phone" type="tel" inputMode="tel" defaultValue={profile.phone} autoComplete="tel" className="input" aria-invalid={!!err.phone} />
          </Field>
          <Field label="Email" name="email" hint="This is your sign-in email, so it can't be changed here." className="sm:col-span-2">
            <input id="email" value={profile.email} readOnly className="input cursor-not-allowed opacity-70" />
          </Field>
        </fieldset>

        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 text-sm font-medium text-fg-2">Delivery address</legend>
          <Field label="Address" name="line1" error={err.line1} className="sm:col-span-2">
            <input id="line1" name="line1" defaultValue={profile.line1} autoComplete="address-line1" className="input" aria-invalid={!!err.line1} />
          </Field>
          <Field label="Apartment, landmark (optional)" name="line2" className="sm:col-span-2">
            <input id="line2" name="line2" defaultValue={profile.line2} autoComplete="address-line2" className="input" />
          </Field>
          <Field label="City" name="city" error={err.city}>
            <input id="city" name="city" defaultValue={profile.city} autoComplete="address-level2" className="input" aria-invalid={!!err.city} />
          </Field>
          <Field label="PIN code" name="postal" error={err.postal}>
            <input id="postal" name="postal" defaultValue={profile.postal} autoComplete="postal-code" inputMode="numeric" maxLength={6} className="input" aria-invalid={!!err.postal} />
          </Field>
          <Field label="State" name="state" error={err.state}>
            <select id="state" name="state" defaultValue={profile.state || "Kerala"} className="input">
              {STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving" : "Save details"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn btn-ghost" disabled={pending}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
