import Link from "next/link";
import type { CSSProperties } from "react";

import { BentoGrid, BentoTile } from "@/components/atoms/bento-tile";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { totalQuestions } from "@/lib/diagnosis/bank";

import { SampleSopDialog } from "../sample-sop-dialog";
import { HeroPhotoTile } from "./hero-visual";
import { LandingSection } from "./landing-section";
import { SopDocumentPreview } from "./sop-document-preview";

export const HERO_ID = "awal";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/**
 * Attention, as a bento: the promise and one primary CTA in a tall mint tile, a real business
 * owner beside it, and a live SOP page under the photo.
 */
export function HeroSection() {
  const copy = id.landing.hero;
  return (
    <LandingSection id={HERO_ID} className="pt-3 sm:pt-4 lg:pt-4">
      <BentoGrid className="lg:grid-cols-12">
        <BentoTile
          tone="mint"
          className="isolate flex flex-col justify-center overflow-hidden p-6 sm:p-10 lg:col-span-7 lg:row-span-2 lg:p-12"
        >
          {/* Moving lime light, top right only: grey text below stays above AA. */}
          <div
            aria-hidden
            className="drift pointer-events-none absolute -top-40 -right-40 -z-10 size-[30rem] bg-radial from-accent-lime/50 to-transparent to-70%"
          />
          <Eyebrow tone="chip" className="enter self-start">
            {copy.eyebrow}
          </Eyebrow>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {copy.titleLead} <span className="marker">{copy.titleMark(totalQuestions)}</span>
          </h1>
          <p className="enter mt-4 max-w-xl text-lg text-muted-foreground" style={delay(120)}>
            {copy.subtitle}
          </p>
          <div className="enter mt-8 flex flex-col gap-3 sm:flex-row" style={delay(220)}>
            <Button asChild size="lg" className="btn-shine">
              <Link href={ROUTES.signup}>{id.common.join}</Link>
            </Button>
            <SampleSopDialog label={copy.secondaryCta} size="lg" />
          </div>
          <p className="enter mt-4 text-sm text-muted-foreground" style={delay(320)}>
            {copy.microcopy}
          </p>
        </BentoTile>
        <HeroPhotoTile className="lg:col-span-5" />
        <SopDocumentPreview compact className="enter lg:col-span-5" />
      </BentoGrid>
    </LandingSection>
  );
}
