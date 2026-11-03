import Link from "next/link";

import { Logo } from "@/components/atoms/logo";
import { HeaderMorph } from "@/components/atoms/route-transition";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { ENTER_APP } from "@/lib/transitions";
import { cn } from "@/lib/utils";

export const LANDING_ANCHORS = {
  how: "cara-kerja",
  pack: "isi-paket",
  faq: "tanya-jawab",
} as const;

/** Green underline that grows from the left on hover and keyboard focus (200ms). */
const UNDERLINE =
  "relative after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100";

/**
 * Marketing header (glass): logo, 3 anchors, "Masuk" (ghost), primary CTA, scroll progress.
 * Both links into the app morph this bar into the app's header tile (route-transition.tsx).
 */
export function SiteHeader() {
  return (
    <HeaderMorph>
      <header className="glass header-elevate sticky top-0 z-40 border-x-0 border-t-0 border-b border-b-border/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link
            href={ROUTES.home}
            className="inline-flex min-h-11 items-center rounded-lg"
            aria-label={id.app.domain}
          >
            <Logo />
          </Link>
          <nav aria-label={id.nav.main} className="ml-6 hidden md:block">
            <ul className="flex gap-1">
              {(Object.keys(LANDING_ANCHORS) as (keyof typeof LANDING_ANCHORS)[]).map((key) => (
                <li key={key}>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className={cn("h-11 font-medium", UNDERLINE)}
                  >
                    <a href={`#${LANDING_ANCHORS[key]}`}>{id.nav[key]}</a>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href={ROUTES.login} transitionTypes={ENTER_APP}>
                {id.common.login}
              </Link>
            </Button>
            <Button asChild className="btn-shine hidden sm:inline-flex">
              <Link href={ROUTES.signup} transitionTypes={ENTER_APP}>
                {id.common.join}
              </Link>
            </Button>
          </div>
        </div>
        {/* Reading progress, driven by page scroll (CSS only). */}
        <div
          aria-hidden
          className="scroll-progress absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-primary to-accent-lime"
        />
      </header>
    </HeaderMorph>
  );
}
