import { SmoothScroll } from "@/components/fx/smooth-scroll";
import { SiteChrome } from "@/components/site/site-chrome";
import { BrandFooter } from "@/components/site/brand-footer";

// Pages built in the landing style: white heroes start right under the dock.
export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <SiteChrome />
      <main id="main" className="relative z-10 bg-[#050816] pb-24 text-white">
        {children}
      </main>
      <BrandFooter />
    </>
  );
}
