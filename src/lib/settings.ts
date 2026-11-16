import "server-only";
import { db, parseJSON } from "./db";

// Every editable piece of site copy / config, with safe defaults.
// Admin edits are stored in the Setting table and merged over these.
export const DEFAULT_SETTINGS = {
  contact: {
    email: "hello@humynex.com",
    careersEmail: "careers@humynex.com",
    phones: ["+91 884 879 2009", "+91 97780 84739"],
    address: ["Vidya Bharathi Nagar, Mattoor", "Kalady, Ernakulam District", "Kerala 683574"],
    mapsUrl: "https://maps.google.com/?q=Mattoor+Kalady+Kerala+683574",
    hours: "Mon to Sat, 9:30 am to 6:30 pm",
    social: { instagram: "", linkedin: "", youtube: "" },
  },
  hero: {
    headline: "Robots you can buy, rent, print and build with.",
    sub: "Parts for your next build, robots for your next event, and a print farm for everything in between. Made in Kalady, Kerala.",
  },
  mission: {
    vision: "A world where everyday objects think, move, and act alongside us.",
    visionBody:
      "We want the physical world to be as capable as the digital one: machines that understand context, anticipate needs, and work with purpose next to the people who use them.",
    mission: "To build the intelligence layer for the physical world.",
    missionBody:
      "We design autonomous systems that turn ordinary objects into capable machines. We started with mobility, and we keep going wherever a machine can serve people better than it does today.",
    quote: "The next great platform shift won't happen on a screen. It will happen in the world around us.",
  },
  stats: [
    { value: 3, suffix: "+", label: "Years of R&D" },
    { value: 25, suffix: "+", label: "Engineers" },
    { value: 8, suffix: "", label: "Patents pending" },
  ],
  pillars: [
    { title: "Autonomy everywhere", body: "Any physical object can become self-directed, from vehicles to the tools on your bench." },
    { title: "Human-centric AI", body: "Our machines amplify people. Technology should adapt to people, not the other way around." },
    { title: "Built for the field", body: "We don't build for demos. Everything we ship has to survive real, messy environments." },
    { title: "Open by default", body: "We share what we learn, partner widely, and build on the open-source community." },
  ],
  rewards: {
    signupBonus: 150, // points, 1 point = ₹1
    pointsPer100: 5, // points earned per ₹100 paid
    maxRedeemPct: 20, // max share of an order payable with points
  },
  shipping: {
    freeAbove: 99900, // paise
    flat: 7900,
  },
  print: {
    setupFee: 4900, // paise per job
    machineRate: 3500, // paise per machine hour
    minOrder: 14900, // paise
    bed: { x: 256, y: 256, z: 256 }, // mm
    qualities: {
      DRAFT: { label: "Draft", layer: 0.28, gramsPerHour: 18, note: "Fast, visible layers" },
      STANDARD: { label: "Standard", layer: 0.2, gramsPerHour: 12, note: "Best for most parts" },
      FINE: { label: "Fine", layer: 0.12, gramsPerHour: 7, note: "Smooth surfaces, slower" },
    } as Record<string, { label: string; layer: number; gramsPerHour: number; note: string }>,
    turnaround: "2 to 4 working days after payment",
  },
  landing: {
    headline: "Your Complete Ecosystem for Robotics and Hardware.",
    sub: "From custom project building and precision 3D printing to sourcing electronics and renting advanced robots—we have everything you need to innovate.",
    serviceArea: "Parts ship across India. Robot rentals within 60 km of Kalady, further on request.",
  },
  // Only real, verifiable items. Sections stay hidden while these are empty.
  testimonials: [] as { quote: string; name: string; role: string; org: string }[],
  clients: [] as { name: string; logo: string }[],
  badges: [] as { label: string; detail: string }[],
  faq: [
    { q: "Do parts come with a warranty?", a: "If a part arrives faulty, tell us within 7 days and we'll replace it. Parts that have been soldered or modified can't be returned unless they were faulty on arrival." },
    { q: "How fast do orders ship?", a: "Parts orders ship within 2 working days of payment. Orders over ₹999 ship free across India." },
    { q: "What's included in a robot rental?", a: "A trained Humynex operator, charged batteries, transport within 60 km of Kalady, and setup before your event. You pay the rent plus a refundable deposit." },
    { q: "Can we cancel or change a rental?", a: "Cancel 7 or more days before the start date for a full refund. Inside 7 days we refund everything except one day's rent." },
    { q: "Do you work evenings and weekends?", a: "Yes for events. Our operators run robots at evening and weekend events as part of the booking. The office replies to messages Monday to Saturday." },
    { q: "How accurate is the online 3D print quote?", a: "It's final for parts that fit our print bed. Larger or unusual parts are checked by an engineer, who confirms the price before you pay." },
    { q: "Can you build something custom, or set up a robotics lab?", a: "Yes. Tell us what you need and we'll reply within one working day, then share a scope, price and timeline after a short call." },
    { q: "How can we pay?", a: "Online through Razorpay: UPI, cards, net banking and wallets. Members can also pay up to 20% of an order with reward points." },
  ],
  // Google accounts allowed into /admin once sign-in is switched on.
  admins: [] as string[],
  announcement: {
    enabled: true,
    text: "New here? Create an account and get 150 reward points (₹150) on your first order.",
    href: "/signup",
  },
};

export type Settings = typeof DEFAULT_SETTINGS;
export type SettingKey = keyof Settings;

/**
 * Inside a transaction, pass its client: the database allows one connection
 * per server instance, so a read through `db` would wait forever for the
 * connection the transaction is holding.
 */
type SettingsReader = { setting: Pick<typeof db.setting, "findMany"> };

export async function getSettings(client: SettingsReader = db): Promise<Settings> {
  const rows = await client.setting.findMany();
  const merged = structuredClone(DEFAULT_SETTINGS) as Settings;
  for (const row of rows) {
    if (row.key in merged) {
      const k = row.key as SettingKey;
      const stored = parseJSON(row.value, null);
      if (stored !== null) {
        // shallow-merge objects so new default fields survive older saved rows
        const base = merged[k] as unknown;
        (merged as Record<string, unknown>)[k] =
          Array.isArray(stored) || typeof stored !== "object" || Array.isArray(base)
            ? stored
            : { ...(base as object), ...(stored as object) };
      }
    }
  }
  return merged;
}

export async function getSetting<K extends SettingKey>(key: K, client: SettingsReader = db): Promise<Settings[K]> {
  const s = await getSettings(client);
  return s[key];
}

export async function saveSetting<K extends SettingKey>(key: K, value: Settings[K]) {
  await db.setting.upsert({
    where: { key },
    create: { key, value: JSON.stringify(value) },
    update: { value: JSON.stringify(value) },
  });
}
