import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BentoTile } from "@/components/atoms/bento-tile";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { PageTransition } from "@/components/atoms/page-transition";
import { Logo } from "@/components/atoms/logo";
import { HeaderMorph, TRANSITION_HOOKS } from "@/components/atoms/route-transition";
import { AuthShowcase } from "@/components/organisms/auth-showcase";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { LEAVE_APP } from "@/lib/transitions";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  intro: { eyebrow: string; title: string; body: string };
  showcase: "team" | "owner";
  children: ReactNode;
  /** False when the form brings its own tiles (the long owner sign-up). */
  formTile?: boolean;
}

/**
 * Login and sign-up as a bento: the page title on a --brand-deep tile, the form in a white
 * tile beside it. Laptops also get the showcase tiles under the title (sticky while a long
 * form scrolls). On phones the title tile sits above the form and nothing else is in the way.
 * Arriving from the landing, the landing's header morphs into the header tile and the tiles
 * rise one after another (route-transition.tsx); "Kembali ke beranda" plays it in reverse.
 */
export function AuthLayout({ intro, showcase, children, formTile = true }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="px-4 pt-3 sm:px-6">
        <HeaderMorph>
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 rounded-2xl border bg-card px-3 sm:px-5">
            <Link
              href={ROUTES.home}
              transitionTypes={LEAVE_APP}
              className="inline-flex min-h-11 items-center rounded-lg px-1"
              aria-label={id.app.domain}
            >
              <Logo />
            </Link>
            <Button asChild variant="ghost">
              <Link href={ROUTES.home} transitionTypes={LEAVE_APP}>
                <ArrowLeftIcon aria-hidden />
                <span className="sr-only sm:not-sr-only">{id.authShowcase.backHome}</span>
              </Link>
            </Button>
          </div>
        </HeaderMorph>
      </header>

      <main id="isi" className="flex-1 px-4 py-3 sm:px-6 sm:py-4 lg:py-6">
        <PageTransition>
          <div className="mx-auto grid max-w-6xl content-start gap-3 *:min-w-0 sm:gap-4 lg:grid-cols-2">
            <div className="grid content-start gap-3 sm:gap-4 lg:sticky lg:top-6 lg:self-start">
              <BentoTile
                tone="deep"
                as="header"
                className={cn("isolate overflow-hidden p-6 sm:p-8", TRANSITION_HOOKS.tile[1])}
              >
                <div
                  aria-hidden
                  className="drift pointer-events-none absolute -top-32 -right-32 -z-10 size-[24rem] bg-radial from-primary/45 to-transparent to-70%"
                />
                <Eyebrow tone="inverse">{intro.eyebrow}</Eyebrow>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                  {intro.title}
                </h1>
                <p className="mt-3 text-lg text-brand-deep-muted">{intro.body}</p>
              </BentoTile>
              <div className={cn("hidden lg:block", TRANSITION_HOOKS.tile[3])}>
                <AuthShowcase variant={showcase} />
              </div>
            </div>

            {formTile ? (
              <BentoTile
                className={cn(
                  "flex flex-col justify-center p-6 sm:p-8 lg:p-10",
                  TRANSITION_HOOKS.tile[2],
                )}
              >
                {children}
              </BentoTile>
            ) : (
              <div className={TRANSITION_HOOKS.tile[2]}>{children}</div>
            )}
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
