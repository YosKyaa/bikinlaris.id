import Link from "next/link";

import { Logo } from "@/components/atoms/logo";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";

export const LANDING_ANCHORS = {
  how: "cara-kerja",
  pack: "isi-paket",
  faq: "tanya-jawab",
} as const;

/**
 * Marketing header as a floating glass tile: logo, 3 anchors, "Masuk" (ghost), primary CTA,
 * scroll progress along its bottom edge.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 px-4 pt-3 sm:px-6">
      <div className="glass header-elevate relative mx-auto flex h-16 max-w-6xl items-center gap-4 overflow-hidden rounded-2xl border-border px-3 sm:px-5">
        <Link
          href={ROUTES.home}
          className="inline-flex min-h-11 items-center rounded-lg px-1"
          aria-label={id.app.domain}
        >
          <Logo />
        </Link>
        <nav aria-label={id.nav.main} className="ml-4 hidden md:block">
          <ul className="flex gap-1">
            {(Object.keys(LANDING_ANCHORS) as (keyof typeof LANDING_ANCHORS)[]).map((key) => (
              <li key={key}>
                <Button asChild variant="ghost" size="sm" className="h-11 font-medium">
                  <a href={`#${LANDING_ANCHORS[key]}`}>{id.nav[key]}</a>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href={ROUTES.login}>{id.common.login}</Link>
          </Button>
          <Button asChild className="btn-shine hidden sm:inline-flex">
            <Link href={ROUTES.signup}>{id.common.join}</Link>
          </Button>
        </div>
        {/* Reading progress, driven by page scroll (CSS only). */}
        <div
          aria-hidden
          className="scroll-progress absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-primary to-accent-lime"
        />
      </div>
    </header>
  );
}
