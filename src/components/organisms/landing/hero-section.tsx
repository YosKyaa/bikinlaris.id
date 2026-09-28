import Link from "next/link";
import type { CSSProperties } from "react";

import { Eyebrow } from "@/components/atoms/eyebrow";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { totalQuestions } from "@/lib/diagnosis/bank";

import { SampleSopDialog } from "../sample-sop-dialog";
import { HeroVisual } from "./hero-visual";

export const HERO_ID = "awal";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/** Attention: concrete outcome, one primary CTA, a real business owner with a live SOP page. */
export function HeroSection() {
  const copy = id.landing.hero;
  return (
    <section id={HERO_ID} className="relative isolate overflow-hidden">
      {/* Soft moving light behind the hero; decorative. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="drift absolute -top-24 right-[-10%] size-[28rem] rounded-full bg-accent-lime/30 blur-3xl" />
        <div
          className="drift absolute top-1/3 left-[-12%] size-[24rem] rounded-full bg-primary/15 blur-3xl"
          style={{ "--delay": "-6s" } as CSSProperties}
        />
      </div>
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 lg:pt-16 lg:pb-24">
        <div className="grid items-center gap-10 *:min-w-0 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <Eyebrow className="enter">{copy.eyebrow}</Eyebrow>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              {copy.title(totalQuestions)}
            </h1>
            <p className="enter mt-4 max-w-xl text-lg text-muted-foreground" style={delay(120)}>
              {copy.subtitle}
            </p>
            <div className="enter mt-8 flex flex-col gap-3 sm:flex-row" style={delay(220)}>
              <Button asChild size="lg" className="btn-shine">
                <Link href={ROUTES.login}>{id.common.startCheck}</Link>
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
