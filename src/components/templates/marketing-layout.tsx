import type { ReactNode } from "react";

import { SiteFooter } from "@/components/organisms/site-footer";
import { SiteHeader } from "@/components/organisms/site-header";

/** Public pages: header, content, footer. */
export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="isi" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
