import {
  ArrowRightIcon,
  CalendarCheckIcon,
  ClipboardListIcon,
  InfoIcon,
  MessageCircleIcon,
  UsersRoundIcon,
} from "lucide-react";
import Link from "next/link";

import { BentoGrid, BentoTile } from "@/components/atoms/bento-tile";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { totalQuestions } from "@/lib/diagnosis/bank";

import { LandingSection } from "./landing/landing-section";

const STEP_ICONS = [MessageCircleIcon, ClipboardListIcon, CalendarCheckIcon] as const;

interface JoinGuideProps {
  notice: string | null;
  /** Set when this device already holds a valid private link. */
  resume: { businessName: string; href: string } | null;
  /** Self-registration link, or null while registration is closed. */
  signupHref: string | null;
}

/**
 * /cara-ikut as a bento: how owners join (register themselves or with an enumerator, then a
 * private link), who can join, and what to do when the link is lost.
 */
export function JoinGuide({ notice, resume, signupHref }: JoinGuideProps) {
  const copy = id.join;
  return (
    <LandingSection className="pt-3 sm:pt-4 lg:pt-4">
      <BentoGrid className="lg:grid-cols-3">
        {notice ? (
          <Alert role="status" className="rounded-2xl lg:col-span-3">
            <InfoIcon aria-hidden />
            <AlertDescription className="text-foreground">{notice}</AlertDescription>
          </Alert>
        ) : null}

        {resume ? (
          <BentoTile
            as="section"
            tone="deep"
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:col-span-3"
          >
            <div>
              <h2 className="text-lg font-semibold">{copy.resumeTitle(resume.businessName)}</h2>
              <p className="text-brand-deep-muted">{copy.resumeBody}</p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-accent-lime text-brand-deep shadow-none hover:bg-accent-lime/90 hover:shadow-none"
            >
              <Link href={resume.href}>
                {copy.resume}
                <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
          </BentoTile>
        ) : null}

        <BentoTile tone="mint" as="header" className="p-6 sm:p-10 lg:col-span-2">
          <Eyebrow tone="chip">{copy.eyebrow}</Eyebrow>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{copy.body}</p>
          {signupHref && !resume ? (
            <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
              <Link href={signupHref}>
                {copy.signup}
                <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
          ) : null}
        </BentoTile>

        <BentoTile as="section" tone="lime" className="flex flex-col justify-between gap-6">
          <span
            aria-hidden
            className="grid size-11 place-items-center rounded-xl bg-brand-deep text-accent-lime"
          >
            <UsersRoundIcon className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">{copy.whoTitle}</h2>
            <p className="mt-1">{copy.whoBody}</p>
          </div>
        </BentoTile>

        <section aria-labelledby="langkah-ikut" className="lg:col-span-3">
          <h2 id="langkah-ikut" className="sr-only">
            {copy.stepsTitle}
          </h2>
          <BentoGrid as="ol" className="md:grid-cols-3">
            {copy.steps.map((step, index) => {
              const Icon = STEP_ICONS[index];
              return (
                <BentoTile key={step.title} as="li" className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span
                      aria-hidden
                      className="grid size-11 place-items-center rounded-xl bg-success-soft text-success"
                    >
                      <Icon className="size-5" />
                    </span>
                    <span aria-hidden className="text-3xl font-bold text-primary/25 tabular-nums">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      <span className="sr-only">{index + 1}. </span>
                      {step.title}
                    </h3>
                    <p className="mt-1 text-muted-foreground">{step.body(totalQuestions)}</p>
                  </div>
                </BentoTile>
              );
            })}
          </BentoGrid>
        </section>

        <BentoTile as="section" className="lg:col-span-3">
          <h2 className="text-lg font-semibold">{copy.lostTitle}</h2>
          <p className="mt-1 text-muted-foreground">{copy.lostBody}</p>
        </BentoTile>
      </BentoGrid>
    </LandingSection>
  );
}
