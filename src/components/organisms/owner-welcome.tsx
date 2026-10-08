import { CheckIcon } from "lucide-react";
import Link from "next/link";

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
 * First screen after opening the private link: who this is for, how long it takes, and that it
 * can be resumed (CLAUDE.md: say the duration before a long task). One primary action.
 */
export function OwnerWelcome({ code, ownerName, businessName, startHref }: OwnerWelcomeProps) {
  const copy = id.owner.welcome;
  return (
    <div className="space-y-8 pb-24 lg:pb-0">
      <header className="space-y-3">
        <Eyebrow>{copy.code(code)}</Eyebrow>
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          {copy.title(ownerName)}{" "}
          <span className="text-muted-foreground">{copy.subtitle(businessName)}</span>
        </h1>
        <p className="text-lg">{copy.body(totalQuestions, sections.length)}</p>
        <TimeEstimate minutes={id.common.durationMinutes} />
      </header>

      <section aria-labelledby="yang-terjadi" className="rounded-xl bg-muted p-5">
        <h2 id="yang-terjadi" className="font-semibold">
          {copy.stepsTitle}
        </h2>
        <ol className="mt-3 space-y-2">
          {copy.steps.map((step) => (
            <li key={step} className="flex gap-3">
              <CheckIcon aria-hidden className="mt-1 size-4 shrink-0 text-primary" />
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:static lg:border-0 lg:p-0">
        <div className="mx-auto max-w-2xl">
          <Button asChild size="lg" className="w-full lg:w-auto">
            <Link href={startHref}>{copy.start}</Link>
          </Button>
        </div>
      </div>

      <form
        action={ownerLogoutAction}
        className="flex flex-wrap items-center gap-x-1 text-muted-foreground"
      >
        <span>{copy.notYou}</span>
        <Button type="submit" variant="link" className="h-11 px-1">
          {id.owner.logout}
        </Button>
      </form>
    </div>
  );
}
