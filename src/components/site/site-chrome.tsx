import { Dock } from "@/components/landing/dock";
import { QuickActions } from "./quick-actions";
import { NAV_LEFT, NAV_RIGHT } from "./nav-config";

/** The floating dock and the account/cart pill, shared by every public page. */
export function SiteChrome() {
  return (
    <>
      <Dock left={NAV_LEFT} right={NAV_RIGHT} />
      <QuickActions />
    </>
  );
}
