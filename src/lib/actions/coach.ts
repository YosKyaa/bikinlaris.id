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
import { coachInstructions } from "@/lib/coach/prompt";
import { data } from "@/lib/data";
import { getOwnerState } from "@/lib/data/owner-session";
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

/**
 * "Tanya coach": one question from the owner (private link cookie), answered by the AI provider
 * with this owner's pack as context. Limited per day; question and answer are stored for the study.
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

  const owner = data().owner;
  let history;
  try {
    history = await owner.coachHistory(state.token);
  } catch {
    return { ok: false, error: copy.failed };
  }
  if (history.askedToday >= COACH_DAILY_LIMIT) return { ok: false, error: copy.limit };

  let answer: string;
  try {
    answer = await provider.generateText({
      instructions: coachInstructions(state.business, pack),
      messages: [
        ...history.turns.slice(-CONTEXT_MESSAGES).map((turn) => ({
          role: turn.role === "pemilik" ? ("user" as const) : ("assistant" as const),
          content: turn.text,
        })),
        { role: "user", content: parsed.data.question },
      ],
      maxOutputTokens: ANSWER_MAX_TOKENS,
      timeoutMs: ANSWER_TIMEOUT_MS,
    });
  } catch (error) {
    return { ok: false, error: failureMessage(error) };
  }
  answer = answer.slice(0, ANSWER_MAX_LENGTH);

  try {
    await owner.saveCoachExchange(state.token, {
      question: parsed.data.question,
      topic: parsed.data.topic,
      answer,
      source: provider.label,
    });
  } catch {
    // The owner still gets the answer; only the research copy is missing.
  }
  return {
    ok: true,
    data: { question: parsed.data.question, answer, askedToday: history.askedToday + 1 },
  };
}
