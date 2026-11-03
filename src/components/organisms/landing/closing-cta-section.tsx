import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { BentoTile } from "@/components/atoms/bento-tile";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";

import { LandingSection } from "./landing-section";

/**
 * Action: repeats the benefit with the single primary CTA, on a --brand-deep tile. The button
 * is white so it stands out on green. Only a green light, top left: lime behind the grey text
 * near --brand-mid drops below AA.
 */
export function ClosingCtaSection() {
  const copy = id.landing.closing;
  return (
    <LandingSection className="pb-8 sm:pb-10 lg:pb-12">
      <BentoTile
        tone="deep"
        className="reveal-scale isolate flex flex-col gap-8 overflow-hidden p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12"
      >
        <div
          aria-hidden
          className="drift pointer-events-none absolute -top-32 -left-32 -z-10 size-[28rem] bg-radial from-primary/50 to-transparent to-70%"
        />
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-balance">{copy.title}</h2>
          <p className="mt-3 text-lg text-brand-deep-muted">{copy.body}</p>
        </div>
        <div className="shrink-0 lg:text-right">
          <Button
            asChild
            size="lg"
            className="btn-shine w-full bg-white text-brand-deep hover:bg-white/90 sm:w-auto"
          >
            <Link href={ROUTES.signup}>
              {id.common.join}
              <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
          <p className="mt-3 max-w-xs text-sm text-brand-deep-muted lg:ml-auto">
            {id.landing.hero.microcopy}
          </p>
        </div>
      </BentoTile>
    </LandingSection>
  );
}
