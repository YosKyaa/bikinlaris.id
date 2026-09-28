"use server";

import type { QuestionId, SectionId } from "@/content/diagnosis";
import { id } from "@/content/id";
import { getBusiness } from "@/lib/data/account";
import { completeDiagnosis, getDiagnosis, resetDiagnosis, saveAnswer } from "@/lib/data/diagnosis";
import { logEvent } from "@/lib/data/events";
import { getPack, startPackGeneration } from "@/lib/data/pack";
import { getSessionUser, isResearcher } from "@/lib/data/session";
import type { Result } from "@/lib/data/types";
import { computeMap, countColors, isSectionComplete } from "@/lib/diagnosis/scoring";
import { saveAnswerSchema, sectionIdSchema } from "@/lib/validations/diagnosis";

async function ownerBusinessId(): Promise<string | null> {
  const user = await getSessionUser();
  if (!user || isResearcher(user) || !user.businessId) return null;
  return user.businessId;
}

const expired = { ok: false, error: id.auth.errors.sessionExpired } as const;

export async function saveAnswerAction(questionId: string, answer: string): Promise<Result<null>> {
  const businessId = await ownerBusinessId();
  if (!businessId) return expired;
  const parsed = saveAnswerSchema.safeParse({ questionId, answer });
  if (!parsed.success || (await getPack(businessId))) {
    return { ok: false, error: id.diagnosis.errors.saveFailed };
  }
  const { first } = await saveAnswer(
    businessId,
    parsed.data.questionId as QuestionId,
    parsed.data.answer,
  );
  if (first) await logEvent(businessId, "diagnosa_mulai");
  return { ok: true, data: null };
}

export async function completeSectionAction(sectionId: string): Promise<Result<null>> {
  const businessId = await ownerBusinessId();
  if (!businessId) return expired;
  const parsed = sectionIdSchema.safeParse(sectionId);
  const diagnosis = await getDiagnosis(businessId);
  if (!parsed.success || !diagnosis) return { ok: false, error: id.diagnosis.errors.advanceFailed };
  const section = parsed.data as SectionId;
  if (!isSectionComplete(section, diagnosis.answers)) {
    return { ok: false, error: id.diagnosis.errors.advanceFailed };
  }
  await logEvent(businessId, "diagnosa_bagian", { bagian: section });
  return { ok: true, data: null };
}

/** Closes the diagnosis and starts building the pack. Once per diagnosis. */
export async function finishDiagnosisAction(hardest: string): Promise<Result<null>> {
  const businessId = await ownerBusinessId();
  if (!businessId) return expired;
  const parsed = sectionIdSchema.safeParse(hardest);
  if (!parsed.success) return { ok: false, error: id.summary.hardestRequired };

  if (await getPack(businessId)) return { ok: true, data: null };
  const business = await getBusiness(businessId);
  const diagnosis = await completeDiagnosis(businessId, parsed.data as SectionId);
  if (!business || !diagnosis) return { ok: false, error: id.summary.incomplete };

  await logEvent(businessId, "diagnosa_selesai", {
    repot: parsed.data,
    ...countColors(computeMap(diagnosis.answers)),
  });
  await startPackGeneration(business, diagnosis);
  return { ok: true, data: null };
}

export async function redoDiagnosisAction(): Promise<Result<null>> {
  const businessId = await ownerBusinessId();
  if (!businessId) return expired;
  await logEvent(businessId, "diagnosa_ulang");
  await resetDiagnosis(businessId);
  return { ok: true, data: null };
}
