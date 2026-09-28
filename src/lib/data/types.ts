import type { ProblemId, QuestionId, SectionId, SopId } from "@/content/diagnosis";
import type { SectionColor, StoredAnswer } from "@/content/diagnosis.types";
import type { BusinessProfile } from "@/lib/validations/business";

/** spec `data_model.memberships.role` */
export type Role = "pemilik" | "enumerator" | "admin";
export const RESEARCH_ROLES: readonly Role[] = ["enumerator", "admin"];

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  businessId: string | null;
}

export interface Business extends BusinessProfile {
  id: string;
  /** Contact shown to researchers. The spec has no phone number; email is used. */
  email: string;
  createdAt: string;
}

export type Answers = Partial<Record<QuestionId, StoredAnswer>>;

/** spec `data_model.diagnosa` (draft kept until the pack is created). */
export interface Diagnosis {
  id: string;
  businessId: string;
  answers: Answers;
  hardestSection: SectionId | null;
  startedAt: string;
  completedAt: string | null;
}

export interface SectionScore {
  score: number;
  /** Number of questions answered with the red answer. */
  redCount: number;
  color: SectionColor;
}

export type BusinessMap = Record<SectionId, SectionScore>;

export interface PackProblem {
  id: ProblemId;
  sectionId: SectionId;
  score: number;
  /** Question ids whose answers raised this problem. */
  evidence: QuestionId[];
}

/** One SOP in a pack. `whyText`/`taskTexts` hold the personalised text (LLM) or null (template). */
export interface PackSop {
  sopId: SopId;
  problemIds: ProblemId[];
  whyText: string | null;
  taskTexts: Record<string, string> | null;
}

export type PackStatus = "menyusun" | "siap" | "gagal";

/** spec `data_model.paket` */
export interface Pack {
  id: string;
  businessId: string;
  diagnosisId: string;
  hardestSection: SectionId;
  map: BusinessMap;
  problems: PackProblem[];
  sops: PackSop[];
  laterSopIds: SopId[];
  /** ISO date (yyyy-mm-dd) the pack was created. */
  createdOn: string;
  /** ISO date of the day-30 follow-up. */
  followUpOn: string;
  source: "template" | "llm";
  status: PackStatus;
  generationStartedAt: string;
  /** Research follow-up (dashboard). Not in the spec data model yet, see docs/PERUBAHAN.md. */
  contactedAt: string | null;
  questionnaireDone: boolean;
}

/** spec `data_model.events.catatan` */
export const EVENT_ACTIONS = [
  "login",
  "profil_selesai",
  "diagnosa_mulai",
  "diagnosa_bagian",
  "diagnosa_selesai",
  "paket_dibuat",
  "hasil_buka",
  "sop_buka",
  "kirim_wa",
  "cetak",
  "diagnosa_ulang",
] as const;
export type EventAction = (typeof EVENT_ACTIONS)[number];

export type EventMeta = Record<string, string | number | boolean | string[] | null>;

export interface ResearchEvent {
  id: number;
  businessId: string;
  action: EventAction;
  meta: EventMeta | null;
  createdAt: string;
}

export interface PackGenerationStatus {
  status: PackStatus;
  done: number;
  total: number;
  /** SOP currently being prepared, null when finished. */
  currentSopId: SopId | null;
}

export type FollowupStatus = "belum_h30" | "siap_dihubungi" | "sudah_dihubungi";

export interface FollowupRow {
  businessId: string;
  businessName: string;
  email: string;
  location: BusinessProfile["location"];
  packCreatedOn: string;
  dayNumber: number;
  followUpOn: string;
  status: FollowupStatus;
  questionnaireDone: boolean;
}

export interface ResearchSummary {
  registered: number;
  diagnosisDone: number;
  packsCreated: number;
  pastDay30: number;
  /** null while the questionnaire module does not exist yet. */
  questionnairesIn: number | null;
}

/** Uniform Server Action result (CLAUDE.md "Clean code"). */
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };
