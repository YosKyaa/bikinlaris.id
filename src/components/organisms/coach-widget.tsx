"use client";

import { MessageCircleQuestionMarkIcon, SendHorizontalIcon, XIcon } from "lucide-react";
import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";

import { CoachConversation, type CoachTurn } from "@/components/molecules/coach-conversation";
import { InlineError } from "@/components/molecules/inline-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { id } from "@/content/id";
import { askCoachAction } from "@/lib/actions/coach";
import type { CoachTopic } from "@/lib/coach/rules";
import type { CoachRole } from "@/lib/data/types";

/** The length counter appears only once the question gets close to the limit. */
const COUNTER_FROM = 0.8;
/** While an answer types, follow it only if the reader is this close to the bottom. */
const FOLLOW_PX = 120;

interface CoachWidgetProps {
  turns: { id: number; role: CoachRole; text: string }[];
  askedToday: number;
  dailyLimit: number;
  maxLength: number;
}

/**
 * "Tanya coach": a labelled button at the bottom right (above the phone action bar) that opens
 * the chat full screen on phones and as a side panel on wider screens. The state lives here, so
 * closing the panel keeps the conversation. Every exchange is stored for the study (said on screen).
 * Like a chat: the question shows at once, a typing bubble while the coach works, then the
 * answer types itself out. On failure the question goes back into the field.
 */
export function CoachWidget({
  turns: initial,
  askedToday,
  dailyLimit,
  maxLength,
}: CoachWidgetProps) {
  const copy = id.coach;
  const inputId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [turns, setTurns] = useState<CoachTurn[]>(initial);
  // Ids for messages made here; negative, so they never clash with stored ones.
  const nextId = useRef(-1);
  const [asked, setAsked] = useState(askedToday);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const remaining = Math.max(0, dailyLimit - asked);

  // Keep the newest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [turns.length, pending]);

  /** Follows a typing answer, unless the reader scrolled up to read something else. */
  function follow() {
    const el = scrollRef.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < FOLLOW_PX) {
      el.scrollTop = el.scrollHeight;
    }
  }

  function ask(question: string, topic: CoachTopic | null) {
    setError(null);
    if (!question.trim()) {
      setError(copy.errors.empty);
      return;
    }
    const questionId = nextId.current--;
    setTurns((list) => [
      ...list,
      { id: questionId, role: "pemilik", text: question.trim(), fresh: true },
    ]);
    if (topic === null) setDraft("");
    startTransition(async () => {
      const result = await askCoachAction(question, topic);
      if (!result.ok) {
        setTurns((list) => list.filter((turn) => turn.id !== questionId));
        if (topic === null) setDraft(question);
        setError(result.error);
        return;
      }
      const answerId = nextId.current--;
      setTurns((list) => [
        ...list.map((turn) =>
          turn.id === questionId ? { ...turn, text: result.data.question } : turn,
        ),
        { id: answerId, role: "coach", text: result.data.answer, fresh: true, typing: true },
      ]);
      setAsked(result.data.askedToday);
    });
  }

  function typed(turnId: number) {
    setTurns((list) =>
      list.map((turn) => (turn.id === turnId && turn.typing ? { ...turn, typing: false } : turn)),
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(draft, null);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="lg"
          className="fixed right-4 bottom-24 z-40 h-12 rounded-full bg-brand-deep px-5 text-white shadow-float hover:bg-brand-deep/90 lg:right-8 lg:bottom-8 print:hidden"
        >
          <MessageCircleQuestionMarkIcon aria-hidden className="text-accent-lime" />
          {copy.open}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="flex-row items-start gap-3 border-b p-4">
          <MessageCircleQuestionMarkIcon
            aria-hidden
            className="mt-0.5 size-6 shrink-0 text-primary"
          />
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-lg font-semibold">{copy.title}</SheetTitle>
            <SheetDescription>{copy.body}</SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon-lg" aria-label={id.common.close}>
              <XIcon aria-hidden />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div
          ref={scrollRef}
          tabIndex={0}
          role="region"
          aria-label={copy.conversation}
          className="flex-1 overflow-y-auto bg-canvas p-4"
        >
          <CoachConversation
            turns={turns}
            pending={pending}
            canAsk={remaining > 0}
            onSuggest={(topic) => ask(copy.suggestions[topic], topic)}
            onProgress={follow}
            onTyped={typed}
          />
        </div>

        <div className="space-y-2 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <InlineError message={error} />
          {remaining > 0 ? (
            <form onSubmit={onSubmit} className="flex gap-2">
              <label htmlFor={inputId} className="sr-only">
                {copy.inputLabel}
              </label>
              <Input
                id={inputId}
                value={draft}
                maxLength={maxLength}
                placeholder={copy.placeholder}
                onChange={(event) => setDraft(event.target.value)}
                className="h-12 flex-1"
              />
              <Button
                type="submit"
                size="icon-lg"
                className="size-12"
                aria-label={copy.send}
                disabled={pending}
              >
                <SendHorizontalIcon aria-hidden />
              </Button>
            </form>
          ) : null}
          <p className="text-sm text-muted-foreground tabular-nums">
            {draft.length > maxLength * COUNTER_FROM
              ? `${copy.counter(draft.length, maxLength)} · `
              : ""}
            {copy.remaining(remaining)} {copy.consent}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
