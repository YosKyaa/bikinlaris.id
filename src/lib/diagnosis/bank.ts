import {
  diagnosisBank,
  type ProblemId,
  type QuestionId,
  type SectionId,
  type SopId,
} from "@/content/diagnosis";
import type { Task, TextLayer, TextVariant } from "@/content/diagnosis.types";

/**
 * Lookup helpers over the generated bank. Pure, safe on server and client.
 *
 * Every text lookup takes an optional wording: the variant for service businesses ("jasa", see
 * lib/diagnosis/variant.ts) and the admin's text edits from the team panel. Texts are layered:
 * bank.json, then edits to the general text, then the bank's variant text, then edits to the
 * variant text. Ids and scoring never depend on the wording.
 */

export type { TextVariant };

/** Which texts the edits apply to: "umum" for everyone, or one variant. */
export type EditVariant = "umum" | TextVariant;
export type TextLayers = Partial<Record<EditVariant, TextLayer>>;

export interface Wording {
  variant: TextVariant | null;
  /** Admin edits from the team panel (lib/data/text-edits.ts). */
  edits?: TextLayers | null;
}

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

/** The layers that apply to one wording, lowest first. */
function layersFor(wording: Wording | null | undefined): TextLayer[] {
  if (!wording) return [];
  const layers: (TextLayer | undefined)[] = [wording.edits?.umum];
  if (wording.variant) {
    layers.push(diagnosisBank.variants[wording.variant], wording.edits?.[wording.variant]);
  }
  return layers.filter((layer): layer is TextLayer => layer !== undefined);
}

export function getSection(id: SectionId, wording?: Wording | null) {
  const section = must(sectionById.get(id), `Bagian ${id}`);
  return layersFor(wording).reduce((text, layer) => ({ ...text, ...layer.sections[id] }), section);
}

export function getQuestion(id: QuestionId, wording?: Wording | null) {
  const question = must(questionById.get(id), `Pertanyaan ${id}`);
  return layersFor(wording).reduce(
    (text, layer) => ({ ...text, ...layer.questions[id] }),
    question,
  );
}

export function getProblem(id: ProblemId, wording?: Wording | null) {
  const problem = must(problemById.get(id), `Masalah ${id}`);
  return layersFor(wording).reduce((text, layer) => ({ ...text, ...layer.problems[id] }), problem);
}

export function getSop(id: SopId, wording?: Wording | null) {
  const sop = must(sopById.get(id), `SOP ${id}`);
  return layersFor(wording).reduce((text, layer) => {
    const override = layer.sops[id];
    if (!override) return text;
    const { tasks: taskOverrides, ...texts } = override;
    return {
      ...text,
      ...texts,
      tasks: text.tasks.map((task): Task => {
        const change = taskOverrides?.[task.id];
        if (!change) return task;
        return task.kind === "siapkan"
          ? { ...task, text: change.text ?? task.text }
          : { ...task, text: change.text ?? task.text, unit: change.unit ?? task.unit };
      }),
    };
  }, sop);
}

/** Problem lookup bound to one wording (handy for `.map`). */
export const problemsIn = (wording: Wording | null | undefined) => (id: ProblemId) =>
  getProblem(id, wording);

export function isSectionId(value: string): value is SectionId {
  return sectionById.has(value as SectionId);
}

export function isSopId(value: string): value is SopId {
  return sopById.has(value as SopId);
}

export function isQuestionId(value: string): value is QuestionId {
  return questionById.has(value as QuestionId);
}

export function isProblemId(value: string): value is ProblemId {
  return problemById.has(value as ProblemId);
}

export function questionsOf(sectionId: SectionId, wording?: Wording | null) {
  return diagnosisBank.questions
    .filter((q) => q.sectionId === sectionId)
    .map((q) => getQuestion(q.id, wording));
}

export function sopsOf(sectionId: SectionId) {
  return diagnosisBank.sops.filter((s) => s.sectionId === sectionId);
}

export const sectionIndex = (id: SectionId) => sections.findIndex((s) => s.id === id);

export const totalQuestions = diagnosisBank.questions.length;
