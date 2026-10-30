"use client";

import { MessageCircleQuestionMarkIcon } from "lucide-react";
import { useId, useState, useTransition, type FormEvent } from "react";

import { CoachBubble } from "@/components/molecules/coach-bubble";
import { InlineError } from "@/components/molecules/inline-error";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { id } from "@/content/id";
import { askCoachAction } from "@/lib/actions/coach";
import { COACH_TOPICS, type CoachTopic } from "@/lib/coach/rules";
import type { CoachRole } from "@/lib/data/types";

interface CoachPanelProps {
  turns: { id: number; role: CoachRole; text: string }[];
  askedToday: number;
  dailyLimit: number;
  maxLength: number;
}

/**
 * "Tanya coach" on the pack page: suggested questions or the owner's own, answered from this
 * pack. Optional, no reminders; every exchange is stored for the study (said on screen).
 */
export function CoachPanel({ turns: initial, askedToday, dailyLimit, maxLength }: CoachPanelProps) {
  const copy = id.coach;
  const inputId = useId();
  const [turns, setTurns] = useState(initial);
  const [asked, setAsked] = useState(askedToday);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const remaining = Math.max(0, dailyLimit - asked);

  function ask(question: string, topic: CoachTopic | null) {
    setError(null);
    startTransition(async () => {
      const result = await askCoachAction(question, topic);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTurns((list) => [
        ...list,
        { id: -list.length - 1, role: "pemilik", text: result.data.question },
        { id: -list.length - 2, role: "coach", text: result.data.answer },
      ]);
      setAsked(result.data.askedToday);
      if (topic === null) setDraft("");
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(draft, null);
  }

  return (
    <section
      aria-labelledby="tanya-coach"
      className="space-y-5 rounded-xl border bg-background p-5 shadow-card sm:p-6 print:hidden"
    >
      <div className="flex gap-3">
        <MessageCircleQuestionMarkIcon aria-hidden className="mt-1 size-6 shrink-0 text-primary" />
        <div>
          <h2 id="tanya-coach" className="text-2xl font-semibold">
            {copy.title}
          </h2>
          <p className="text-muted-foreground">{copy.body}</p>
        </div>
      </div>

      <ul aria-live="polite" className="space-y-3">
        {turns.map((turn) => (
          <CoachBubble key={turn.id} role={turn.role} text={turn.text} />
        ))}
        {pending ? (
          <li className="text-sm text-muted-foreground" role="status">
            {copy.pending}
          </li>
        ) : null}
      </ul>

      {remaining > 0 ? (
        <>
          <div>
            <p className="mb-2 text-sm font-medium">{copy.suggestionsLabel}</p>
            <div className="flex flex-wrap gap-2">
              {COACH_TOPICS.map((topic) => (
                <Button
                  key={topic}
                  type="button"
                  variant="outline"
                  disabled={pending}
                  className="h-auto min-h-11 w-full justify-start py-2 text-left whitespace-normal sm:w-auto"
                  onClick={() => ask(copy.suggestions[topic], topic)}
                >
                  {copy.suggestions[topic]}
                </Button>
              ))}
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-2">
            <label htmlFor={inputId} className="font-medium">
              {copy.inputLabel}
            </label>
            <Textarea
              id={inputId}
              value={draft}
              maxLength={maxLength}
              rows={3}
              placeholder={copy.placeholder}
              onChange={(event) => setDraft(event.target.value)}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-muted-foreground tabular-nums">
                {copy.counter(draft.length, maxLength)}
              </span>
              <Button type="submit" variant="outline" className="h-11" disabled={pending}>
                {copy.send}
              </Button>
            </div>
          </form>
        </>
      ) : null}

      <InlineError message={error} />
      <p className="text-sm text-muted-foreground">
        {copy.remaining(remaining)} {copy.consent}
      </p>
    </section>
  );
}
