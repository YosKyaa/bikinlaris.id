import type { ReactNode } from "react";

import { PageTransition } from "@/components/atoms/page-transition";
import type { ResearcherNavProps } from "@/components/organisms/researcher-nav";
import { ResearcherMobileBar } from "@/components/organisms/researcher-mobile-bar";
import { ResearcherNav } from "@/components/organisms/researcher-nav";

interface DashboardShellProps {
  nav: Omit<ResearcherNavProps, "onNavigate">;
  /** Shown above every page, e.g. the demo-data banner. */
  notice?: ReactNode;
  children: ReactNode;
}

/**
 * Researcher panel as a dashboard (owner request): a --brand-deep sidebar that stays in place
 * on laptops, a header tile with a menu drawer on phones, bento content on the canvas.
 * Printing (monitoring page) shows the content only.
 */
export function DashboardShell({ nav, notice, children }: DashboardShellProps) {
  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] print:block print:bg-white">
      <aside className="sticky top-0 hidden h-dvh p-3 pr-0 lg:block print:hidden">
        <div className="relative isolate h-full overflow-y-auto rounded-2xl bg-brand-deep">
          {/* Green light behind the logo only; the text below sits on plain --brand-deep. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 -z-10 size-72 bg-radial from-primary/40 to-transparent to-70%"
          />
          <ResearcherNav {...nav} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <ResearcherMobileBar {...nav} />
        <main
          id="isi"
          className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 pt-4 pb-16 sm:space-y-6 sm:px-6 lg:px-8 lg:pt-6 print:max-w-none print:p-0"
        >
          {notice}
          <PageTransition className="space-y-4 sm:space-y-6">{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
