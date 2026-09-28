"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { Eyebrow } from "@/components/atoms/eyebrow";
import { SaveIndicator, type SaveStatus } from "@/components/atoms/save-indicator";
import { StepCounter } from "@/components/atoms/step-counter";
import { TimeEstimate } from "@/components/atoms/time-estimate";
import { InlineError } from "@/components/molecules/inline-error";
import { QuestionField } from "@/components/molecules/question-field";
import { StepActionBar } from "@/components/molecules/step-action-bar";
import { Progress } from "@/components/ui/progress";
import type { StoredAnswer } from "@/content/diagnosis.types";
import { id } from "@/content/id";
import { completeSectionAction, saveAnswerAction } from "@/lib/actions/diagnosis";

export interface StepperQuestion {
  id: string;
  text: string;
  reversed: boolean;
  skipWhen: string | null;
}

interface DiagnosisStepperProps {
  section: { id: string; label: string; description: string };
  index: number;
  totalSections: number;
  questions: StepperQuestion[];
  initialAnswers: Record<string, StoredAnswer>;
  /** Answered questions in other sections, for the overall progress bar. */
  answeredElsewhere: number;
  totalQuestions: number;
  prevHref: string | null;
  nextHref: string;
  isLast: boolean;
}

/** One section per screen with autosave per answer (optimistic) and a sticky action bar. */
export function DiagnosisStepper(props: DiagnosisStepperProps) {
  const { section, questions, prevHref, nextHref, isLast } = props;
  const router = useRouter();
  const [answers, setAnswers] = useState(props.initialAnswers);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [showMissing, setShowMissing] = useState(false);
  const [advanceError, setAdvanceError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const latestSave = useRef(0);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const answeredHere = questions.filter((q) => answers[q.id]).length;
  const answeredTotal = props.answeredElsewhere + answeredHere;
  const missing = questions.filter((q) => !answers[q.id]);
  const isFresh = props.index === 0 && answeredTotal === 0;

  async function handleAnswer(questionId: string, value: StoredAnswer) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setSaveStatus("saving");
    const ticket = ++latestSave.current;
    const result = await saveAnswerAction(questionId, value);
    if (ticket === latestSave.current) setSaveStatus(result.ok ? "saved" : "error");
  }

  function handleNext() {
    setAdvanceError(null);
    if (missing.length > 0) {
      setShowMissing(true);
      const first = questionRefs.current[missing[0].id];
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      first?.querySelector<HTMLInputElement>("input[type=radio]")?.focus({ preventScroll: true });
      return;
    }
    startTransition(async () => {
      const result = await completeSectionAction(section.id);
      if (!result.ok) {
        setAdvanceError(result.error);
        return;
      }
      router.push(nextHref);
    });
  }

  return (
    <div className="pb-28 sm:pb-0">
      <div className="sticky top-14 z-20 -mx-4 border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <StepCounter current={props.index + 1} total={props.totalSections} />
          <SaveIndicator status={saveStatus} />
        </div>
        <Progress
          value={(answeredTotal / props.totalQuestions) * 100}
          className="mt-2 h-2"
          aria-label={id.diagnosis.progress(answeredTotal, props.totalQuestions)}
        />
        <p className="mt-1 text-sm text-muted-foreground tabular-nums">
          {id.diagnosis.progress(answeredTotal, props.totalQuestions)}
        </p>
      </div>

      <header className="mt-6 space-y-2">
        <Eyebrow>{id.diagnosis.eyebrow}</Eyebrow>
        <h1 className="text-3xl font-bold tracking-tight">{section.label}</h1>
        <p className="text-muted-foreground">
          {section.description}. {id.diagnosis.intro}
        </p>
        {isFresh ? (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-muted p-3">
            <TimeEstimate minutes={id.common.durationMinutes} />
            <span className="text-sm text-muted-foreground">
              {id.diagnosis.beforeStart(props.totalQuestions, props.totalSections)}
            </span>
          </p>
        ) : null}
      </header>

      <ol className="mt-6 space-y-4">
        {questions.map((question, index) => (
          <li
            key={question.id}
            ref={(node) => {
              questionRefs.current[question.id] = node as HTMLDivElement | null;
            }}
          >
            <QuestionField
              number={index + 1}
              text={question.text}
              reversed={question.reversed}
              skipWhen={question.skipWhen}
              value={answers[question.id]}
              onChange={(value) => handleAnswer(question.id, value)}
              whyAsked={id.diagnosis.whyAskedBody(section.label, section.description)}
              invalid={showMissing}
            />
          </li>
        ))}
      </ol>

      <div className="mt-4 space-y-2">
        {showMissing && missing.length > 0 ? (
          <InlineError message={id.diagnosis.unanswered(missing.length)} />
        ) : null}
        <InlineError message={advanceError} />
      </div>

      <StepActionBar
        backHref={prevHref}
        nextLabel={isLast ? id.diagnosis.toSummary : id.diagnosis.next}
        onNext={handleNext}
        pending={pending}
      />
    </div>
  );
}
