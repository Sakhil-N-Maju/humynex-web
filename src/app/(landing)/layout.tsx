import { SmoothScroll } from "@/components/fx/smooth-scroll";

/** The landing page has its own chrome: the dock nav and a minimal footer. */
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      {children}
    </>
  );
}
