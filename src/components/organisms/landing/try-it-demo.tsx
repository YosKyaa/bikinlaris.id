"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { SectionStatusBadge } from "@/components/atoms/section-status-badge";
import { QuestionField } from "@/components/molecules/question-field";
import { Button } from "@/components/ui/button";
import type { AnswerValue, SectionColor, StoredAnswer } from "@/content/diagnosis.types";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

export interface DemoQuestion {
  id: string;
  text: string;
  reversed: boolean;
  redAnswer: AnswerValue;
  yellowAnswer: AnswerValue;
  sectionLabel: string;
  sectionDescription: string;
  problemTitle: string;
  problemImpact: string;
  sopTitle: string;
}

/** Same verdict words as the real map: red answer → "Perlu dirapikan", yellow → "Ada yang ganggu". */
function verdict(question: DemoQuestion, answer: StoredAnswer | undefined): SectionColor | null {
  if (!answer) return null;
  if (answer === question.redAnswer) return "merah";
  if (answer === question.yellowAnswer) return "kuning";
  return "hijau";
}

/** Instant one-line feedback right under the question, for phones (the full panel sits below). */
function InlineVerdict({
  question,
  color,
}: {
  question: DemoQuestion;
  color: SectionColor | null;
}) {
  if (!color) return null;
  return (
    <p
      key={color}
      className="mt-2 flex animate-fade-up flex-wrap items-center gap-2 px-1 text-sm lg:hidden"
    >
      <SectionStatusBadge color={color} />
      {color === "hijau" ? null : (
        <span>
          <span className="text-muted-foreground">{id.landing.tryIt.sopMatch}: </span>
          <span className="font-semibold text-primary">{question.sopTitle}</span>
        </span>
      )}
    </p>
  );
}

/** Three real questions with instant feedback. Nothing is stored or logged. */
export function TryItDemo({
  questions,
  totalQuestions,
}: {
  questions: DemoQuestion[];
  totalQuestions: number;
}) {
  const [answers, setAnswers] = useState<Record<string, StoredAnswer>>({});
  const copy = id.landing.tryIt;
  const results = questions.map((q) => ({ q, color: verdict(q, answers[q.id]) }));
  const answered = results.filter((r) => r.color);
  const found = answered.filter((r) => r.color !== "hijau");

  return (
    <div className="grid gap-8 *:min-w-0 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
      <ol className="space-y-4">
        {questions.map((question, index) => (
          <li key={question.id}>
            <QuestionField
              number={index + 1}
              text={question.text}
              reversed={question.reversed}
              skipWhen={null}
              value={answers[question.id]}
              onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
              whyAsked={id.diagnosis.whyAskedBody(
                question.sectionLabel,
                question.sectionDescription,
              )}
            />
            <InlineVerdict question={question} color={verdict(question, answers[question.id])} />
          </li>
        ))}
      </ol>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border bg-background p-5 sm:p-6">
          <h3 className="text-lg font-semibold">{copy.resultTitle}</h3>
          <div aria-live="polite" className="mt-4 space-y-3">
            {answered.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-muted-foreground">
                {copy.resultEmpty}
              </p>
            ) : (
              <>
                <p className="font-medium">{copy.count(found.length, answered.length)}</p>
                <ul className="space-y-3">
                  {answered.map(({ q, color }) => (
                    <li
                      key={`${q.id}-${color}`}
                      className={cn(
                        "animate-fade-up rounded-lg border-l-4 bg-muted p-4",
                        color === "merah" && "border-l-destructive",
                        color === "kuning" && "border-l-warning",
                        color === "hijau" && "border-l-success",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-muted-foreground">{q.sectionLabel}</span>
                        {color ? <SectionStatusBadge color={color} /> : null}
                      </div>
                      {color === "hijau" ? (
                        <p className="mt-1">{copy.fine(q.sectionLabel)}</p>
                      ) : (
                        <>
                          <p className="mt-1 font-semibold">{q.problemTitle}</p>
                          <p className="text-muted-foreground">{q.problemImpact}</p>
                          <p className="mt-2 text-sm">
                            <span className="text-muted-foreground">{copy.sopMatch}: </span>
                            <span className="font-semibold text-primary">{q.sopTitle}</span>
                          </p>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="mt-6 border-t pt-5">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={ROUTES.login}>
                {copy.cta}
                <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">{copy.ctaNote(totalQuestions)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
