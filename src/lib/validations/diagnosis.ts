import { z } from "zod";

import { ANSWER_VALUES, SKIP_ANSWER } from "@/content/diagnosis.types";
import { isQuestionId, isSectionId, isSopId } from "@/lib/diagnosis/bank";

export const questionIdSchema = z.string().refine(isQuestionId);
export const sectionIdSchema = z.string().refine(isSectionId);
export const sopIdSchema = z.string().refine(isSopId);

export const saveAnswerSchema = z.object({
  questionId: questionIdSchema,
  answer: z.enum([...ANSWER_VALUES, SKIP_ANSWER]),
});
