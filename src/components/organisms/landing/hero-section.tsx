import Link from "next/link";
import type { CSSProperties } from "react";

import { Eyebrow } from "@/components/atoms/eyebrow";
import { TRANSITION_HOOKS } from "@/components/atoms/route-transition";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { totalQuestions } from "@/lib/diagnosis/bank";
import { ENTER_APP } from "@/lib/transitions";
import { cn } from "@/lib/utils";

import { SampleSopDialog } from "../sample-sop-dialog";
import { HeroVisual } from "./hero-visual";

export const HERO_ID = "awal";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/** Attention: concrete outcome, one primary CTA, a real business owner with a live SOP page. */
export function HeroSection() {
  const copy = id.landing.hero;
  return (
    <section
      id={HERO_ID}
      className={cn(
        "relative isolate overflow-hidden bg-linear-to-b from-success-soft via-success-soft/40 to-background",
        TRANSITION_HOOKS.landingHero,
      )}
    >
      {/* Moving lime light behind the hero; decorative. Lime keeps grey text above AA. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="drift absolute -top-48 right-[-25%] size-[44rem] bg-radial from-accent-lime/60 to-transparent to-70%" />
        <div
          className="drift absolute -bottom-40 left-[-30%] size-[36rem] bg-radial from-accent-lime/35 to-transparent to-70%"
          style={{ "--delay": "-6s" } as CSSProperties}
        />
      </div>
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 lg:pt-16 lg:pb-24">
        <div className="grid items-center gap-10 *:min-w-0 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <Eyebrow tone="pill" className="enter">
              {copy.eyebrow}
            </Eyebrow>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              {copy.titleLead} <span className="marker">{copy.titleMark(totalQuestions)}</span>
            </h1>
            <p className="enter mt-4 max-w-xl text-lg text-muted-foreground" style={delay(120)}>
              {copy.subtitle}
            </p>
            <div className="enter mt-8 flex flex-col gap-3 sm:flex-row" style={delay(220)}>
              <Button asChild size="lg" className="btn-shine">
                <Link href={ROUTES.signup} transitionTypes={ENTER_APP}>
                  {id.common.join}
                </Link>
              </Button>
              <SampleSopDialog label={copy.secondaryCta} size="lg" />
            </div>
            <p className="enter mt-4 text-sm text-muted-foreground" style={delay(320)}>
              {copy.microcopy}
            </p>
          </div>
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
