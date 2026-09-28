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

/** Marketing header: logo, 3 anchors, "Masuk" (ghost) and the primary CTA. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href={ROUTES.home} className="rounded-lg" aria-label={id.app.domain}>
          <Logo />
        </Link>
        <nav aria-label={id.nav.main} className="ml-6 hidden md:block">
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
          <Button asChild className="hidden sm:inline-flex">
            <Link href={ROUTES.login}>{id.common.startCheck}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
