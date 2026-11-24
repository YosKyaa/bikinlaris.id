import type { ProblemId, QuestionId, SectionId, SopId } from "@/content/diagnosis";
import type { SectionColor, StoredAnswer } from "@/content/diagnosis.types";
import type { BusinessProfile } from "@/lib/validations/business";

/**
 * Research team role. UMKM owners have no account: they reach their data through a private
 * link (access token) sent over WhatsApp by the enumerator.
 */
export type StaffRole = "enumerator" | "admin";

export interface StaffUser {
  id: string;
  email: string;
  name: string | null;
  role: StaffRole;
}

export interface Business extends BusinessProfile {
  id: string;
  /** Participant code shown to the owner and typed into the questionnaire (e.g. "BL-023"). */
  code: string;
  ownerName: string;
  /** WhatsApp number in international format without "+", e.g. "6281234567890". */
  whatsapp: string;
  createdAt: string;
  /** Team member who added the participant; null when self-registered or the account was removed. */
  createdBy: string | null;
  /**
   * Team member who looks after this participant (pendamping). Starts as the one who added
   * it; null = not assigned yet (self-registration, or the member left the team).
   */
  assignedTo: string | null;
  signupVia: SignupVia;
}

/** How a participant joined: added by an enumerator, or registered themselves at /ikut. */
export const SIGNUP_VIAS = ["pendamping", "mandiri"] as const;
export type SignupVia = (typeof SIGNUP_VIAS)[number];

export type Answers = Partial<Record<QuestionId, StoredAnswer>>;

/** spec `data_model.diagnosa` (draft kept until the pack is created). */
export interface Diagnosis {
  id: string;
  businessId: string;
  answers: Answers;
  hardestSection: SectionId | null;
  startedAt: string;
  completedAt: string | null;
  /**
   * Version of the admin text edits when the check started (bank_teks_riwayat id, 0 = bank.json
   * as is). Absent for checks started before 24 November 2026.
   */
  textVersion?: number | null;
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

export type PackStatus = "menyusun" | "siap";
export type PackSource = "template" | "llm";

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
  /** ISO date (yyyy-mm-dd, WIB) the pack was created. */
  createdOn: string;
  /** ISO date of the day-30 questionnaire. */
  followUpOn: string;
  source: PackSource;
  status: PackStatus;
  generationStartedAt: string;
  /** Questionnaire link sent over WhatsApp by the research team. */
  questionnaireSentAt: string | null;
  /** Marked by the research team once the SurveyMonkey answers are in. */
  questionnaireDoneAt: string | null;
}

/** Everything the owner pages need, resolved from the private link. */
export interface OwnerState {
  token: string;
  business: Business;
  diagnosis: Diagnosis | null;
  pack: Pack | null;
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
  "coach_tanya",
  "unduh_pdf",
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

/** "Tanya coach": who wrote a message. */
export const COACH_ROLES = ["pemilik", "coach"] as const;
export type CoachRole = (typeof COACH_ROLES)[number];

/** One message as the owner sees it in the coach panel. */
export interface CoachTurn {
  id: number;
  role: CoachRole;
  text: string;
  createdAt: string;
}

/** Recent conversation plus how many questions the owner asked today (WIB), for the limit. */
export interface CoachHistory {
  turns: CoachTurn[];
  askedToday: number;
}

/** One message as the research team sees it (panel, CSV). */
export interface CoachMessage extends CoachTurn {
  businessId: string;
  /** Suggested-question key, or null for a question typed by the owner. */
  topic: string | null;
  /** AI provider and model that wrote a coach answer, e.g. "openai:gpt-6-luna". */
  source: string | null;
}

/** Result of one attempt to reach the owner (table kontak_catatan), e.g. at day 30. */
export const CONTACT_OUTCOMES = [
  "tersambung",
  "tidak_diangkat",
  "nomor_salah",
  "minta_nanti",
  "menolak",
] as const;
export type ContactOutcome = (typeof CONTACT_OUTCOMES)[number];

export interface ContactNote {
  id: number;
  businessId: string;
  /** Team member who wrote it; null once their login account is gone. */
  staffId: string | null;
  outcome: ContactOutcome;
  note: string | null;
  createdAt: string;
}

/** Coach use on one day (WIB), for the admin's cost view. */
export interface CoachUsageDay {
  /** yyyy-mm-dd */
  date: string;
  /** Slots taken = AI calls started. */
  reserved: number;
  answered: number;
  /** The model answered with the off-topic marker. */
  offTopic: number;
  /** Slot taken, answer never stored (AI error or time-out). */
  failed: number;
  /** Turned away by the app's own check, no AI call (no tokens). */
  refused: number;
  inputTokens: number;
  outputTokens: number;
}

/** A question the app's check turned away, so the admin can spot wrong refusals. */
export interface CoachRefusal {
  businessId: string;
  code: string;
  text: string;
  createdAt: string;
}

export interface CoachUsage {
  days: CoachUsageDay[];
  latestRefusals: CoachRefusal[];
}

/** Input for a new participant, entered by the enumerator. */
export interface NewParticipant extends BusinessProfile {
  ownerName: string;
  whatsapp: string;
}

/** A participant with their progress, as the researcher panel sees it. */
export interface Participant {
  business: Business;
  /** Private link token; only exposed to the research team. */
  token: string;
  diagnosis: Diagnosis | null;
  pack: Pack | null;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: StaffRole;
}

/** Pending invite. The code is shared by the admin over WhatsApp and typed at /daftar. */
export interface TeamInvite {
  email: string;
  role: StaffRole;
  code: string;
}

/** Where a participant is in the 30-day study. */
export type ParticipantStage =
  "belum_mulai" | "cek_usaha" | "belum_h30" | "siap_dikirim" | "terkirim" | "selesai";

export const FUNNEL_STEPS = [
  "registered",
  "diagnosisStarted",
  "diagnosisDone",
  "packsCreated",
  "pastDay30",
  "questionnaireSent",
  "questionnaireDone",
] as const;
export type FunnelStepKey = (typeof FUNNEL_STEPS)[number];

export interface FunnelStep {
  key: FunnelStepKey;
  count: number;
}

/** "Kirim kuesioner minggu ini": day 30 is past or close, questionnaire not sent yet. */
export type DueGroup = "overdue" | "today" | "tomorrow" | "later";

export interface DueItem {
  businessId: string;
  code: string;
  businessName: string;
  ownerName: string;
  whatsapp: string;
  followUpOn: string;
  dayNumber: number;
  group: DueGroup;
}

export interface ParticipantRow {
  businessId: string;
  code: string;
  businessName: string;
  ownerName: string;
  whatsapp: string;
  location: BusinessProfile["location"];
  packCreatedOn: string | null;
  dayNumber: number | null;
  followUpOn: string | null;
  stage: ParticipantStage;
  /** Team member looking after this participant, or null. */
  assignedTo: string | null;
  /** Newest contact note, or null when nobody has reached out yet. */
  lastContact: Pick<ContactNote, "outcome" | "createdAt"> | null;
  contactCount: number;
}

/** Uniform Server Action result (CLAUDE.md "Clean code"). */
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };
