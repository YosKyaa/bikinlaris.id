import { ArrowRightIcon, InfoIcon, KeyRoundIcon, MessageCircleIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

import { Eyebrow } from "@/components/atoms/eyebrow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { totalQuestions } from "@/lib/diagnosis/bank";

const STEP_ICONS = [UsersIcon, MessageCircleIcon, KeyRoundIcon] as const;

interface JoinGuideProps {
  notice: string | null;
  /** Set when this device already holds a valid private link. */
  resume: { businessName: string; href: string } | null;
}

/** /cara-ikut: how owners join (with an enumerator, then a private WhatsApp link). */
export function JoinGuide({ notice, resume }: JoinGuideProps) {
  const copy = id.join;
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:px-6 lg:py-16">
      {notice ? (
        <Alert role="status">
          <InfoIcon aria-hidden />
          <AlertDescription className="text-foreground">{notice}</AlertDescription>
        </Alert>
      ) : null}

      {resume ? (
        <section className="flex flex-col gap-4 rounded-xl bg-brand-deep p-5 text-white shadow-float sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">{copy.resumeTitle(resume.businessName)}</h2>
            <p className="text-white/80">{copy.resumeBody}</p>
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
        </section>
      ) : null}

      <header className="space-y-3">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{copy.title}</h1>
        <p className="text-lg text-muted-foreground">{copy.body}</p>
      </header>

      <section aria-labelledby="langkah-ikut">
        <h2 id="langkah-ikut" className="sr-only">
          {copy.stepsTitle}
        </h2>
        <ol className="space-y-3">
          {copy.steps.map((step, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <li
                key={step.title}
                className="flex gap-4 rounded-xl border bg-background p-5 shadow-card"
              >
                <span
                  aria-hidden
                  className="grid size-11 shrink-0 place-items-center rounded-lg bg-muted text-primary"
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold">
                    <span className="tabular-nums">{index + 1}. </span>
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.body(totalQuestions)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-4 *:min-w-0 sm:grid-cols-2">
        <section className="rounded-xl bg-muted p-5">
          <h2 className="font-semibold">{copy.whoTitle}</h2>
          <p className="mt-1 text-muted-foreground">{copy.whoBody}</p>
        </section>
        <section className="rounded-xl bg-muted p-5">
          <h2 className="font-semibold">{copy.lostTitle}</h2>
          <p className="mt-1 text-muted-foreground">{copy.lostBody}</p>
        </section>
      </div>
    </div>
  );
}
