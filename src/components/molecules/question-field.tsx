"use client";

import { CheckIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

function isStoredAnswer(value: string): value is StoredAnswer {
  return value === SKIP_ANSWER || (ANSWER_VALUES as readonly string[]).includes(value);
}

/** One diagnosis question: text, three large answer options, optional skip, "Kenapa ditanya?". */
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
  const labelId = `${baseId}-label`;
  const whyId = `${baseId}-why`;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 sm:p-5",
        invalid && !value ? "border-destructive bg-destructive-soft/40" : "bg-background",
      )}
    >
      <p id={labelId} className="font-semibold">
        <span className="mr-1 text-muted-foreground tabular-nums">{number}.</span>
        {text}
      </p>

      <RadioGroup
        aria-labelledby={labelId}
        aria-invalid={invalid && !value}
        value={value ?? ""}
        onValueChange={(next) => isStoredAnswer(next) && onChange(next)}
        className="mt-3 grid grid-cols-3 gap-2"
      >
        {ANSWER_VALUES.map((answer) => {
          const optionId = `${baseId}-${answer}`;
          const selected = value === answer;
          return (
            <label
              key={answer}
              htmlFor={optionId}
              className={cn(
                "relative flex min-h-12 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-2 bg-muted px-2 text-center font-semibold transition-colors duration-150",
                "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                selected
                  ? "border-primary bg-success-soft text-success"
                  : "border-transparent text-foreground hover:border-border",
              )}
            >
              <RadioGroupItem
                id={optionId}
                value={answer}
                className="absolute inset-0 size-full rounded-lg opacity-0 after:hidden"
              />
              {selected ? <CheckIcon aria-hidden className="size-4 shrink-0" /> : null}
              {answerLabel(answer, reversed)}
            </label>
          );
        })}

        {skipWhen ? (
          <label
            htmlFor={`${baseId}-skip`}
            className="col-span-3 flex min-h-11 cursor-pointer items-center gap-2 text-muted-foreground has-data-[state=checked]:font-semibold has-data-[state=checked]:text-foreground"
          >
            <RadioGroupItem id={`${baseId}-skip`} value={SKIP_ANSWER} />
            {copy.answers.skip(skipWhen)}
          </label>
        ) : null}
      </RadioGroup>

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
    </div>
  );
}
