import Link from "next/link";

import { BentoGrid, BentoTile } from "@/components/atoms/bento-tile";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { TimeEstimate } from "@/components/atoms/time-estimate";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ownerLogoutAction } from "@/lib/actions/owner";
import { sections, totalQuestions } from "@/lib/diagnosis/bank";

interface OwnerWelcomeProps {
  code: string;
  ownerName: string;
  businessName: string;
  startHref: string;
}

/**
 * First screen after opening the private link, as a bento: who this is for, how long it takes
 * and that it can be resumed (CLAUDE.md: say the duration before a long task), the size of the
 * check in two number tiles, then what happens. One primary action.
 */
export function OwnerWelcome({ code, ownerName, businessName, startHref }: OwnerWelcomeProps) {
  const copy = id.owner.welcome;
  return (
    <div className="pb-24 lg:pb-0">
      <BentoGrid className="grid-cols-2">
        <BentoTile tone="mint" as="header" className="col-span-2 p-6 sm:p-8">
          <Eyebrow tone="chip">{copy.code(code)}</Eyebrow>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance">
            {copy.title(ownerName)}{" "}
            <span className="text-muted-foreground">{copy.subtitle(businessName)}</span>
          </h1>
          <p className="mt-3 text-lg">{copy.body(totalQuestions, sections.length)}</p>
          <TimeEstimate minutes={id.common.durationMinutes} className="mt-4" />
        </BentoTile>

        <BentoTile tone="lime" as="figure" className="flex flex-col justify-between gap-2">
          <span className="text-4xl font-bold tabular-nums sm:text-5xl">{totalQuestions}</span>
          <figcaption className="font-medium">{id.authShowcase.owner.questions}</figcaption>
        </BentoTile>
        <BentoTile as="figure" className="flex flex-col justify-between gap-2">
          <span className="text-4xl font-bold tabular-nums sm:text-5xl">{sections.length}</span>
          <figcaption className="font-medium text-muted-foreground">
            {id.landing.credibility.facts.sections}
          </figcaption>
        </BentoTile>

        <BentoTile as="section" aria-labelledby="yang-terjadi" className="col-span-2">
          <h2 id="yang-terjadi" className="text-lg font-semibold">
            {copy.stepsTitle}
          </h2>
          <ol className="mt-4 space-y-3">
            {copy.steps.map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-deep text-sm font-bold text-white tabular-nums">
                  {index + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </BentoTile>
      </BentoGrid>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:static lg:mt-6 lg:border-0 lg:bg-transparent lg:p-0">
        <div className="mx-auto max-w-2xl">
          <Button asChild size="lg" className="w-full lg:w-auto">
            <Link href={startHref}>{copy.start}</Link>
          </Button>
        </div>
      </div>

      <form
        action={ownerLogoutAction}
        className="mt-6 flex flex-wrap items-center gap-x-1 text-muted-foreground"
      >
        <span>{copy.notYou}</span>
        <Button type="submit" variant="link" className="h-11 px-1">
          {id.owner.logout}
        </Button>
      </form>
    </div>
  );
}
