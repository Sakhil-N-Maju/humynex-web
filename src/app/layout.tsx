import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

// Every page reads the live database (prices, stock, admin edits) or the session,
// so render on request. This also keeps the build from needing the database.
export const dynamic = "force-dynamic";

// Inter with the optical-size axis; opsz 32 is the "Inter Display" cut.
const inter = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.humynexrobotics.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Humynex Robotics: robotics parts, robot rentals and 3D printing in Kerala",
    template: "%s | Humynex Robotics",
  },
  description:
    "Buy electronics and robotics components, rent a robot dog or serving robot for your event, and get instant 3D print quotes. Humynex Robotics, Kalady, Kerala.",
  openGraph: {
    type: "website",
    siteName: "Humynex Robotics",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#050816",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-[100dvh]">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
