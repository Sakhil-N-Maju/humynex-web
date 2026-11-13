import { getSetting } from "@/lib/settings";
import { SiteFooter } from "@/components/landing/site-footer";

/** The landing footer, loaded with live contact settings, for every other page. */
export async function BrandFooter() {
  const c = await getSetting("contact");
  return (
    <SiteFooter
      socials={Object.entries(c.social)
        .filter(([, url]) => url)
        .map(([name, url]) => ({ label: name, href: url }))}
      phone={c.phones[0] ?? ""}
      email={c.email}
      address={c.address}
    />
  );
}
