import {
  diagnosisBank,
  type ProblemId,
  type QuestionId,
  type SectionId,
  type SopId,
} from "@/content/diagnosis";

/** Lookup helpers over the generated bank. Pure, safe on server and client. */

export const sections = diagnosisBank.sections;
export const rules = diagnosisBank.rules;

const sectionById = new Map(diagnosisBank.sections.map((s) => [s.id, s]));
const questionById = new Map(diagnosisBank.questions.map((q) => [q.id, q]));
const problemById = new Map(diagnosisBank.problems.map((p) => [p.id, p]));
const sopById = new Map(diagnosisBank.sops.map((s) => [s.id, s]));

function must<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`${what} tidak ada di bank.`);
  return value;
}

export const getSection = (id: SectionId) => must(sectionById.get(id), `Bagian ${id}`);
export const getQuestion = (id: QuestionId) => must(questionById.get(id), `Pertanyaan ${id}`);
export const getProblem = (id: ProblemId) => must(problemById.get(id), `Masalah ${id}`);
export const getSop = (id: SopId) => must(sopById.get(id), `SOP ${id}`);

export function isSectionId(value: string): value is SectionId {
  return sectionById.has(value as SectionId);
}

export function isSopId(value: string): value is SopId {
  return sopById.has(value as SopId);
}

export function isQuestionId(value: string): value is QuestionId {
  return questionById.has(value as QuestionId);
}

export function questionsOf(sectionId: SectionId) {
  return diagnosisBank.questions.filter((q) => q.sectionId === sectionId);
}

export function sopsOf(sectionId: SectionId) {
  return diagnosisBank.sops.filter((s) => s.sectionId === sectionId);
}

export const sectionIndex = (id: SectionId) => sections.findIndex((s) => s.id === id);

export const totalQuestions = diagnosisBank.questions.length;
