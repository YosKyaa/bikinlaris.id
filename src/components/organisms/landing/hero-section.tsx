import Link from "next/link";

import { Eyebrow } from "@/components/atoms/eyebrow";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { totalQuestions } from "@/lib/diagnosis/bank";

import { SampleSopDialog } from "../sample-sop-dialog";
import { SopDocumentPreview } from "./sop-document-preview";

export const HERO_ID = "awal";

/** Attention: concrete outcome, one primary CTA, example SOP as the visual. */
export function HeroSection() {
  const copy = id.landing.hero;
  return (
    <section id={HERO_ID} className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 lg:pt-16 lg:pb-24">
      <div className="grid items-center gap-10 *:min-w-0 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {copy.title(totalQuestions)}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">{copy.subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={ROUTES.login}>{id.common.startCheck}</Link>
            </Button>
            <SampleSopDialog
              trigger={
                <Button variant="outline" size="lg">
                  {copy.secondaryCta}
                </Button>
              }
            />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{copy.microcopy}</p>
        </div>
        <SopDocumentPreview />
      </div>
    </section>
  );
}
