"use server";

import { z } from "zod";

import { id } from "@/content/id";
import { AiError, getAiProvider } from "@/lib/ai";
import {
  ANSWER_MAX_LENGTH,
  ANSWER_MAX_TOKENS,
  ANSWER_TIMEOUT_MS,
  COACH_DAILY_LIMIT,
  COACH_TOPICS,
  CONTEXT_MESSAGES,
  QUESTION_MAX_LENGTH,
} from "@/lib/coach/rules";
import { guardQuestion, isOffTopicAnswer } from "@/lib/coach/guard";
import { coachInstructions, quoteQuestion } from "@/lib/coach/prompt";
import { data } from "@/lib/data";
import { getOwnerState } from "@/lib/data/owner-session";
import type { CoachQuotaStatus } from "@/lib/data/source";
import type { Result } from "@/lib/data/types";
import { env } from "@/lib/env";

const questionSchema = z.object({
  question: z.string().trim().min(1, "empty").max(QUESTION_MAX_LENGTH, "tooLong"),
  topic: z.enum(COACH_TOPICS).nullable(),
});

export interface CoachReply {
  question: string;
  answer: string;
  askedToday: number;
}

/** Owner-facing message for a failed AI call; the reason itself is for the team only. */
function failureMessage(error: unknown): string {
  const copy = id.coach.errors;
  if (
    error instanceof AiError &&
    (error.reason === "kuota_habis" || error.reason === "batas_pemakaian")
  ) {
    return copy.busy;
  }
  return copy.failed;
}

const QUOTA_ERRORS: Record<Exclude<CoachQuotaStatus, "ok">, string> = {
  terlalu_cepat: id.coach.errors.tooFast,
  batas_harian: id.coach.errors.limit,
  batas_semua: id.coach.errors.allBusy,
};

/**
 * "Tanya coach": one question from the owner (private link cookie), answered by the AI provider
 * with this owner's pack as context. Guarded so tokens cannot run away:
 * 1. owner session, pack ready, length limit;
 * 2. plainly off-topic or rule-breaking questions get a fixed reply, with no AI call;
 * 3. one slot is taken in the database before the AI call (pause, per-owner and all-owners
 *    daily limits, atomic, never handed back);
 * 4. the question goes to the model as quoted data; an off-topic marker becomes the fixed reply.
 * Question and answer are stored for the study.
 */
export async function askCoachAction(
  question: string,
  topic: string | null,
): Promise<Result<CoachReply>> {
  const copy = id.coach.errors;
  const state = await getOwnerState();
  if (!state) return { ok: false, error: id.owner.errors.noLink };
  const { pack } = state;
  const provider = env.AI_COACH ? getAiProvider() : null;
  if (!provider || pack?.status !== "siap") return { ok: false, error: copy.off };

  const parsed = questionSchema.safeParse({ question, topic });
  if (!parsed.success) {
    const tooLong = parsed.error.issues.some((issue) => issue.message === "tooLong");
    return { ok: false, error: tooLong ? copy.tooLong(QUESTION_MAX_LENGTH) : copy.empty };
  }
  const guarded = guardQuestion(parsed.data.question);
  if (guarded.ok && !guarded.question) return { ok: false, error: copy.empty };

  const owner = data().owner;
  let history;
  try {
    history = await owner.coachHistory(state.token);
  } catch {
    return { ok: false, error: copy.failed };
  }
  if (!guarded.ok) {
    return {
      ok: true,
      data: {
        question: parsed.data.question,
        answer: id.coach.offTopic,
        askedToday: history.askedToday,
      },
    };
  }
  if (history.askedToday >= COACH_DAILY_LIMIT) return { ok: false, error: copy.limit };

  let quota;
  try {
    quota = await owner.reserveCoach(state.token);
  } catch {
    return { ok: false, error: copy.failed };
  }
  if (quota.status !== "ok") return { ok: false, error: QUOTA_ERRORS[quota.status] };

  let answer: string;
  try {
    answer = await provider.generateText({
      instructions: coachInstructions(state.business, pack),
      messages: [
        ...history.turns
          .slice(-CONTEXT_MESSAGES)
          .map((turn) =>
            turn.role === "pemilik"
              ? { role: "user" as const, content: quoteQuestion(turn.text) }
              : { role: "assistant" as const, content: turn.text },
          ),
        { role: "user", content: quoteQuestion(guarded.question) },
      ],
      maxOutputTokens: ANSWER_MAX_TOKENS,
      timeoutMs: ANSWER_TIMEOUT_MS,
    });
  } catch (error) {
    return { ok: false, error: failureMessage(error) };
  }
  answer = isOffTopicAnswer(answer) ? id.coach.offTopic : answer.slice(0, ANSWER_MAX_LENGTH);

  try {
    await owner.saveCoachExchange(state.token, {
      question: guarded.question,
      topic: parsed.data.topic,
      answer,
      source: provider.label,
    });
  } catch {
    // The owner still gets the answer; only the research copy is missing.
  }
  return {
    ok: true,
    data: { question: guarded.question, answer, askedToday: quota.used },
  };
}
