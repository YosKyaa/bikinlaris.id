import type { TextLayer } from "@/content/diagnosis.types";

import {
  getProblem,
  getQuestion,
  getSection,
  getSop,
  isProblemId,
  isQuestionId,
  isSectionId,
  isSopId,
  type EditVariant,
  type TextLayers,
  type Wording,
} from "./bank";

/**
 * Text edits made by an admin in the team panel ("Bank pertanyaan"). Only texts can change:
 * what a question is called, never its answer key, points, or the problem and SOP it triggers.
 * Codes follow bank.json (and the database table `bank_teks`). Pure, safe on server and client.
 */

export const EDIT_KINDS = ["bagian", "pertanyaan", "masalah", "sop", "tugas"] as const;
export type EditKind = (typeof EDIT_KINDS)[number];

export const EDIT_FIELDS = [
  "label",
  "deskripsi",
  "teks",
  "lewati_bila",
  "judul",
  "akar",
  "dampak",
  "tujuan",
] as const;
export type EditField = (typeof EDIT_FIELDS)[number];

export const EDIT_VARIANTS = ["umum", "jasa"] as const satisfies readonly EditVariant[];

/** Which fields each kind of text has. */
export const FIELDS_BY_KIND = {
  bagian: ["label", "deskripsi"],
  pertanyaan: ["teks", "lewati_bila"],
  masalah: ["judul", "akar", "dampak"],
  sop: ["judul", "tujuan"],
  tugas: ["teks"],
} as const satisfies Record<EditKind, readonly EditField[]>;

/** Longest text per field, so an edit still fits the screens and the printed SOP. */
export const EDIT_MAX_LENGTH: Record<EditField, number> = {
  label: 60,
  deskripsi: 120,
  teks: 220,
  lewati_bila: 80,
  judul: 90,
  akar: 320,
  dampak: 200,
  tujuan: 180,
};

export interface EditTarget {
  kind: EditKind;
  /** Bank id; a task is "<sop id>:<task id>". */
  key: string;
  field: EditField;
  variant: EditVariant;
}

export interface TextEdit extends EditTarget {
  value: string;
  updatedAt: string;
}

export interface TextEditHistoryItem extends EditTarget {
  id: number;
  /** Null = the bank.json text (no edit before, or the edit was undone). */
  oldValue: string | null;
  newValue: string | null;
  byName: string | null;
  at: string;
}

export const taskKey = (sopId: string, taskId: string) => `${sopId}:${taskId}`;
export const targetId = (t: EditTarget) => `${t.kind}|${t.key}|${t.field}|${t.variant}`;

function splitTaskKey(key: string): [string, string] {
  const [sopId = "", taskId = ""] = key.split(":");
  return [sopId, taskId];
}

/** The target names a text that exists in the bank and may be edited. */
export function isEditTarget(target: EditTarget): boolean {
  const fields: readonly EditField[] = FIELDS_BY_KIND[target.kind];
  if (!fields.includes(target.field)) return false;
  switch (target.kind) {
    case "bagian":
      return isSectionId(target.key);
    case "pertanyaan":
      return (
        isQuestionId(target.key) &&
        (target.field !== "lewati_bila" || getQuestion(target.key).skipWhen !== null)
      );
    case "masalah":
      return isProblemId(target.key);
    case "sop":
      return isSopId(target.key);
    case "tugas": {
      const [sopId, taskId] = splitTaskKey(target.key);
      return isSopId(sopId) && getSop(sopId).tasks.some((task) => task.id === taskId);
    }
  }
}

const emptyLayer = (): TextLayer => ({ sections: {}, questions: {}, problems: {}, sops: {} });

/** Database rows → layers for lib/diagnosis/bank.ts. Rows for unknown ids are ignored. */
export function editsToLayers(edits: readonly TextEdit[]): TextLayers {
  const layers: TextLayers = {};
  for (const edit of edits) {
    if (!isEditTarget(edit)) continue;
    const layer = (layers[edit.variant] ??= emptyLayer());
    const { key, value } = edit;
    switch (edit.kind) {
      case "bagian":
        layer.sections[key] = {
          ...layer.sections[key],
          [edit.field === "label" ? "label" : "description"]: value,
        };
        break;
      case "pertanyaan":
        layer.questions[key] = {
          ...layer.questions[key],
          [edit.field === "teks" ? "text" : "skipWhen"]: value,
        };
        break;
      case "masalah": {
        const field =
          edit.field === "judul" ? "title" : edit.field === "akar" ? "rootCause" : "impact";
        layer.problems[key] = { ...layer.problems[key], [field]: value };
        break;
      }
      case "sop":
        layer.sops[key] = {
          ...layer.sops[key],
          [edit.field === "judul" ? "title" : "goal"]: value,
        };
        break;
      case "tugas": {
        const [sopId, taskId] = splitTaskKey(key);
        const sop = layer.sops[sopId] ?? {};
        layer.sops[sopId] = { ...sop, tasks: { ...sop.tasks, [taskId]: { text: value } } };
        break;
      }
    }
  }
  return layers;
}

/** The text a target shows with these edits (null: no such text, or not skippable). */
export function readText(target: EditTarget, edits: readonly TextEdit[]): string | null {
  const wording: Wording = {
    variant: target.variant === "umum" ? null : target.variant,
    edits: editsToLayers(edits),
  };
  const { key } = target;
  switch (target.kind) {
    case "bagian": {
      if (!isSectionId(key)) return null;
      const section = getSection(key, wording);
      return target.field === "label" ? section.label : section.description;
    }
    case "pertanyaan": {
      if (!isQuestionId(key)) return null;
      const question = getQuestion(key, wording);
      return target.field === "teks" ? question.text : question.skipWhen;
    }
    case "masalah": {
      if (!isProblemId(key)) return null;
      const problem = getProblem(key, wording);
      if (target.field === "judul") return problem.title;
      return target.field === "akar" ? problem.rootCause : problem.impact;
    }
    case "sop": {
      if (!isSopId(key)) return null;
      const sop = getSop(key, wording);
      return target.field === "judul" ? sop.title : sop.goal;
    }
    case "tugas": {
      const [sopId, taskId] = splitTaskKey(key);
      if (!isSopId(sopId)) return null;
      return getSop(sopId, wording).tasks.find((task) => task.id === taskId)?.text ?? null;
    }
  }
}

export interface EditableText {
  target: EditTarget;
  /** What the owner sees now. */
  current: string;
  /** What they would see without this edit (bank.json, or the general text for "jasa"). */
  original: string;
  edited: boolean;
  /** "jasa" without a text of its own: the general text is shown. */
  sameAsGeneral: boolean;
}

/** Everything the edit dialog needs for one text. Null when the text does not exist. */
export function editableText(target: EditTarget, edits: readonly TextEdit[]): EditableText | null {
  const id = targetId(target);
  const others = edits.filter((edit) => targetId(edit) !== id);
  const current = readText(target, edits);
  const original = readText(target, others);
  if (current === null || original === null) return null;
  const edited = others.length !== edits.length;
  const general =
    target.variant === "umum" ? null : readText({ ...target, variant: "umum" }, edits);
  return { target, current, original, edited, sameAsGeneral: general === current && !edited };
}
