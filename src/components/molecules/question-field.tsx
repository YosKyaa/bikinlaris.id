"use client";

import { CheckIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ANSWER_VALUES,
  SKIP_ANSWER,
  type AnswerValue,
  type StoredAnswer,
} from "@/content/diagnosis.types";
import { id as copy } from "@/content/id";
import { cn } from "@/lib/utils";

interface QuestionFieldProps {
  number: number;
  text: string;
  /** Reversed question: third option reads "Tidak". */
  reversed: boolean;
  skipWhen: string | null;
  value: StoredAnswer | undefined;
  onChange: (value: StoredAnswer) => void;
  whyAsked: string;
  invalid?: boolean;
}

function answerLabel(answer: AnswerValue, reversed: boolean) {
  if (answer === "belum" && reversed) return copy.answers.tidak;
  return copy.answers[answer];
}

/**
 * One diagnosis question: text, three large answer options, optional skip, "Kenapa ditanya?".
 * Native radio inputs (fieldset + legend): no extra JavaScript on low-end phones, arrow keys
 * work out of the box.
 */
export function QuestionField({
  number,
  text,
  reversed,
  skipWhen,
  value,
  onChange,
  whyAsked,
  invalid = false,
}: QuestionFieldProps) {
  const baseId = useId();
  const [showWhy, setShowWhy] = useState(false);
  const whyId = `${baseId}-why`;
  const showInvalid = invalid && !value;

  return (
    <fieldset
      aria-invalid={showInvalid || undefined}
      className={cn(
        "rounded-xl border p-4 sm:p-5",
        showInvalid ? "border-destructive bg-destructive-soft/40" : "bg-background shadow-card",
      )}
    >
      <legend className="float-left w-full font-semibold">
        <span className="mr-1 text-muted-foreground tabular-nums">{number}.</span>
        {text}
      </legend>

      <div className="clear-both grid grid-cols-3 gap-2 pt-3">
        {ANSWER_VALUES.map((answer) => {
          const selected = value === answer;
          return (
            <label
              key={answer}
              className={cn(
                "relative flex min-h-12 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-2 bg-muted px-2 text-center font-semibold transition-colors duration-150",
                "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                selected
                  ? "border-primary bg-success-soft text-success"
                  : "border-transparent text-foreground hover:border-border",
              )}
            >
              <input
                type="radio"
                name={baseId}
                value={answer}
                checked={selected}
                onChange={() => onChange(answer)}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
              {selected ? <CheckIcon aria-hidden className="size-4 shrink-0" /> : null}
              {answerLabel(answer, reversed)}
            </label>
          );
        })}

        {skipWhen ? (
          <label className="col-span-3 flex min-h-11 cursor-pointer items-center gap-2 text-muted-foreground has-checked:font-semibold has-checked:text-foreground">
            <input
              type="radio"
              name={baseId}
              value={SKIP_ANSWER}
              checked={value === SKIP_ANSWER}
              onChange={() => onChange(SKIP_ANSWER)}
              className="size-4 accent-primary"
            />
            {copy.answers.skip(skipWhen)}
          </label>
        ) : null}
      </div>

      <Button
        type="button"
        variant="link"
        size="sm"
        className="mt-1 h-11 px-0 text-muted-foreground"
        aria-expanded={showWhy}
        aria-controls={whyId}
        onClick={() => setShowWhy((open) => !open)}
      >
        {copy.diagnosis.whyAsked}
      </Button>
      <p id={whyId} hidden={!showWhy} className="rounded-lg bg-muted p-3 text-muted-foreground">
        {whyAsked}
      </p>
    </fieldset>
  );
}
