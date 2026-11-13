import { SmoothScroll } from "@/components/fx/smooth-scroll";
import { SiteChrome } from "@/components/site/site-chrome";
import { BrandFooter } from "@/components/site/brand-footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <SiteChrome />
      <main id="main" data-theme="dark" className="relative z-10 pb-16 pt-24">
        {children}
      </main>
      <BrandFooter />
    </>
  );
}
