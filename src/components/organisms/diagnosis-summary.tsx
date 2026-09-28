"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { InlineError } from "@/components/molecules/inline-error";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SectionStatusBadge } from "@/components/atoms/section-status-badge";
import type { SectionColor } from "@/content/diagnosis.types";
import { id } from "@/content/id";
import { finishDiagnosisAction } from "@/lib/actions/diagnosis";
import { ROUTES } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

import { AnswerReview, type ReviewSection } from "./answer-review";

export interface HardestOption {
  id: string;
  label: string;
  description: string;
  color: SectionColor;
}

interface DiagnosisSummaryProps {
  sections: ReviewSection[];
  hardestOptions: HardestOption[];
  initialHardest: string | null;
}

/** Recognition over recall: review answers, pick "paling bikin repot", confirm once. */
export function DiagnosisSummary({
  sections,
  hardestOptions,
  initialHardest,
}: DiagnosisSummaryProps) {
  const router = useRouter();
  const [hardest, setHardest] = useState(initialHardest ?? "");
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const complete = sections.every((s) => s.complete);

  function requestCreate() {
    if (!complete) return setError(id.summary.incomplete);
    if (!hardest) return setError(id.summary.hardestRequired);
    setError(null);
    setConfirmOpen(true);
  }

  function create() {
    startTransition(async () => {
      const result = await finishDiagnosisAction(hardest);
      if (!result.ok) {
        setConfirmOpen(false);
        setError(result.error);
        return;
      }
      router.push(ROUTES.generating);
    });
  }

  return (
    <div className="space-y-10 pb-28 lg:pb-0">
      <AnswerReview sections={sections} />

      <section aria-labelledby="hardest-title" className="space-y-4">
        <div>
          <h2 id="hardest-title" className="text-2xl font-semibold">
            {id.summary.hardestTitle}
          </h2>
          <p className="text-muted-foreground">{id.summary.hardestBody}</p>
        </div>
        <RadioGroup
          aria-labelledby="hardest-title"
          value={hardest}
          onValueChange={(value) => {
            setHardest(value);
            setError(null);
          }}
          className="gap-2"
        >
          {hardestOptions.map((option) => (
            <label
              key={option.id}
              htmlFor={`hardest-${option.id}`}
              className={cn(
                "flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-colors duration-150 has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                hardest === option.id ? "border-primary bg-success-soft" : "border-border",
              )}
            >
              <RadioGroupItem id={`hardest-${option.id}`} value={option.id} />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{option.label}</span>
                <span className="block text-sm text-muted-foreground">{option.description}</span>
              </span>
              <SectionStatusBadge color={option.color} />
            </label>
          ))}
        </RadioGroup>
      </section>

      <InlineError message={error} />

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:static lg:border-0 lg:p-0">
        <div className="mx-auto max-w-2xl">
          <Button size="lg" className="w-full lg:w-auto" onClick={requestCreate} disabled={pending}>
            {pending ? id.summary.pending : id.summary.cta}
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={(open) => !pending && setConfirmOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{id.summary.confirm.title}</AlertDialogTitle>
            <AlertDialogDescription>{id.summary.confirm.body}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>{id.summary.confirm.cancel}</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                create();
              }}
            >
              {pending ? id.summary.pending : id.summary.confirm.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
