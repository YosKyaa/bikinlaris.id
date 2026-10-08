import { z } from "zod";

import type { ProblemId, QuestionId, SectionId, SopId } from "@/content/diagnosis";
import { ANSWER_VALUES, SECTION_COLORS, SKIP_ANSWER } from "@/content/diagnosis.types";
import type { Answers, BusinessMap, PackProblem, PackSop } from "@/lib/data/types";
import { isProblemId, isQuestionId, isSectionId, isSopId, sections } from "@/lib/diagnosis/bank";

/**
 * Schemas for JSON stored in the database (diagnosa.jawaban, paket.peta/masalah/sops).
 * Rows are validated when read so a malformed row fails loudly instead of rendering nonsense.
 */

const questionId = z
  .string()
  .refine(isQuestionId)
  .transform((v) => v as QuestionId);
const sectionId = z
  .string()
  .refine(isSectionId)
  .transform((v) => v as SectionId);
const problemId = z
  .string()
  .refine(isProblemId)
  .transform((v) => v as ProblemId);
const sopId = z
  .string()
  .refine(isSopId)
  .transform((v) => v as SopId);
const answer = z.enum([...ANSWER_VALUES, SKIP_ANSWER]);

export const answersSchema = z.record(z.string(), answer).transform((record): Answers => {
  const answers: Answers = {};
  for (const [key, value] of Object.entries(record)) {
    if (isQuestionId(key)) answers[key] = value;
  }
  return answers;
});

const sectionScoreSchema = z.object({
  score: z.number(),
  redCount: z.number(),
  color: z.enum(SECTION_COLORS),
});

export const mapSchema = z
  .record(z.string(), sectionScoreSchema)
  .refine((record) => sections.every((s) => s.id in record))
  .transform((record) => record as BusinessMap);

export const problemsSchema = z.array(
  z.object({
    id: problemId,
    sectionId,
    score: z.number(),
    evidence: z.array(questionId),
  }),
) satisfies z.ZodType<PackProblem[]>;

export const packSopsSchema = z.array(
  z.object({
    sopId,
    problemIds: z.array(problemId),
    whyText: z.string().nullable(),
    taskTexts: z.record(z.string(), z.string()).nullable(),
  }),
) satisfies z.ZodType<PackSop[]>;

export const sopIdsSchema = z.array(sopId);
export const storedSectionIdSchema = sectionId;
