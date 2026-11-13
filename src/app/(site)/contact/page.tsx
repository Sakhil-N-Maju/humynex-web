import type { Metadata } from "next";
import { getSetting } from "@/lib/settings";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to Humynex Robotics about parts, robot rentals, 3D printing, custom builds or robotics lab setups.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const [{ topic }, c] = await Promise.all([searchParams, getSetting("contact")]);
  return (
    <div className="mx-auto grid max-w-[1400px] gap-16 px-4 pt-12 md:px-8 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h1 className="display-wide text-5xl md:text-6xl">Talk to the team.</h1>
        <p className="mt-4 max-w-[44ch] text-lg text-fg-2">
          Questions about a part, a rental date, a print or a custom build. We usually reply within one working day.
        </p>
        <dl className="mt-12 space-y-8">
          <div>
            <dt className="text-sm text-fg-3">Call</dt>
            {c.phones.map((p) => (
              <dd key={p}><a href={`tel:${p.replace(/\s/g, "")}`} className="font-mono text-xl hover:text-volt-hi">{p}</a></dd>
            ))}
            <dd className="mt-1 text-sm text-fg-3">{c.hours}</dd>
          </div>
          <div>
            <dt className="text-sm text-fg-3">Email</dt>
            <dd><a href={`mailto:${c.email}`} className="text-xl hover:text-volt-hi">{c.email}</a></dd>
          </div>
          <div>
            <dt className="text-sm text-fg-3">Lab</dt>
            <dd>
              <address className="not-italic text-lg">{c.address.map((l) => <span key={l} className="block">{l}</span>)}</address>
              <a href={c.mapsUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-volt-hi hover:underline">Open in Maps</a>
            </dd>
          </div>
        </dl>
      </div>
      <div className="surface h-fit bg-ink-2 p-6 md:p-8">
        <ContactForm defaultTopic={topic} />
      </div>
    </div>
  );
}
