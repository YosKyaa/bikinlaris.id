import { z } from "zod";

import { ANSWER_VALUES, SKIP_ANSWER } from "@/content/diagnosis.types";
import type { Answers } from "@/lib/data/types";
import { isQuestionId, isSectionId, isSopId, totalQuestions } from "@/lib/diagnosis/bank";

export const questionIdSchema = z.string().refine(isQuestionId);
export const sectionIdSchema = z.string().refine(isSectionId);
export const sopIdSchema = z.string().refine(isSopId);

const storedAnswerSchema = z.enum([...ANSWER_VALUES, SKIP_ANSWER]);

/**
 * Several answers sent in one request (question id → answer). Every key must be a bank
 * question, and no request carries more than the whole diagnosis.
 */
export const answersPayloadSchema = z
  .record(z.string(), storedAnswerSchema)
  .refine((record) => Object.keys(record).every(isQuestionId), "pertanyaan_tidak_valid")
  .refine((record) => Object.keys(record).length <= totalQuestions, "terlalu_banyak")
  .transform((record) => record as Answers);
