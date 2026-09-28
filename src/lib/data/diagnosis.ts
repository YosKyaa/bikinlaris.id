import "server-only";

import type { QuestionId, SectionId } from "@/content/diagnosis";
import type { StoredAnswer } from "@/content/diagnosis.types";
import { firstIncompleteSection } from "@/lib/diagnosis/scoring";

import { newId, store } from "./mock-store";
import type { Diagnosis } from "./types";

/** Current diagnosis draft for a business, or null when none was started. */
export async function getDiagnosis(businessId: string): Promise<Diagnosis | null> {
  return store().diagnoses.get(businessId) ?? null;
}

export async function getOrCreateDiagnosis(businessId: string): Promise<Diagnosis> {
  const s = store();
  const existing = s.diagnoses.get(businessId);
  if (existing) return existing;
  const diagnosis: Diagnosis = {
    id: newId(),
    businessId,
    answers: {},
    hardestSection: null,
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
  s.diagnoses.set(businessId, diagnosis);
  return diagnosis;
}

/** Autosave of one answer. Returns whether this was the first answer (for `diagnosa_mulai`). */
export async function saveAnswer(
  businessId: string,
  questionId: QuestionId,
  answer: StoredAnswer,
): Promise<{ first: boolean }> {
  const diagnosis = await getOrCreateDiagnosis(businessId);
  const first = Object.keys(diagnosis.answers).length === 0;
  diagnosis.answers = { ...diagnosis.answers, [questionId]: answer };
  return { first };
}

export async function completeDiagnosis(
  businessId: string,
  hardest: SectionId,
): Promise<Diagnosis | null> {
  const diagnosis = store().diagnoses.get(businessId);
  if (!diagnosis || firstIncompleteSection(diagnosis.answers) !== null) return null;
  diagnosis.hardestSection = hardest;
  diagnosis.completedAt = new Date().toISOString();
  return diagnosis;
}

/** "Ulang cek usaha": clears answers and removes the current pack (prototype `ulangDiagnosa`). */
export async function resetDiagnosis(businessId: string): Promise<void> {
  const s = store();
  s.diagnoses.delete(businessId);
  s.packs.delete(businessId);
}
