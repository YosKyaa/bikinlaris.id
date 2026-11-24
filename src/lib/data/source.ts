import type { SectionId, SopId } from "@/content/diagnosis";
import type { AiUsage } from "@/lib/ai/types";
import type { EditTarget, TextEdit, TextEditHistoryItem } from "@/lib/diagnosis/edits";
import type { ErrorReport } from "@/lib/monitoring/types";
import type { Json } from "@/types/database";

import type {
  Answers,
  BusinessMap,
  CoachHistory,
  CoachMessage,
  CoachUsage,
  ContactNote,
  ContactOutcome,
  EventAction,
  EventMeta,
  NewParticipant,
  OwnerState,
  Pack,
  PackProblem,
  PackSop,
  PackSource,
  Participant,
  ResearchEvent,
  StaffUser,
  TeamInvite,
  TeamMember,
} from "./types";

/**
 * The swap point between demo data and Supabase. Pages and actions never talk to a backend
 * directly: they go through `data()` (lib/data/index.ts), which picks one implementation.
 */

export interface PackStart {
  hardest: SectionId;
  map: BusinessMap;
  problems: PackProblem[];
  sops: PackSop[];
  laterSopIds: SopId[];
  followUpDays: number;
}

export interface PackResult {
  sops: PackSop[];
  source: PackSource;
  /** Raw model output, kept for the research audit trail (never shown to owners). */
  raw: Json | null;
}

/** Owner side: everything is keyed by the private link token. */
export interface OwnerStore {
  getState(token: string): Promise<OwnerState | null>;
  /**
   * Stores one or more answers in a single round trip and returns every answer stored so far.
   * `first: true` when these are the first answers of the diagnosis (event `diagnosa_mulai`).
   */
  saveAnswers(token: string, answers: Answers): Promise<{ first: boolean; answers: Answers }>;
  /** Closes the diagnosis and creates the pack (status "menyusun"). Idempotent. */
  startPack(token: string, input: PackStart): Promise<Pack>;
  /** Stores the final SOP texts and marks the pack "siap". Idempotent. */
  finishPack(token: string, result: PackResult): Promise<Pack>;
  /** "Ulang cek usaha": answers and pack are removed, the event log stays. */
  reset(token: string): Promise<void>;
  /** Passive research log. `hasil_buka` is stored at most once per day. */
  log(token: string, action: EventAction, meta: EventMeta | null): Promise<void>;
  /** Self-registration (/ikut): creates the business and returns its private link token. */
  register(input: NewParticipant): Promise<RegisterResult>;
  /** "Tanya coach": recent messages and today's question count. */
  coachHistory(token: string): Promise<CoachHistory>;
  /**
   * Stores one question with its answer, and logs `coach_tanya`. Only for a slot taken with
   * reserveCoach in the last two minutes, once per slot (the database refuses otherwise).
   */
  saveCoachExchange(token: string, exchange: CoachExchange): Promise<void>;
  /** A question the app turned away without an AI call (at most 20 kept per owner per day). */
  logCoachRefusal(token: string, question: string): Promise<void>;
  /**
   * Takes one coach slot before the AI is called, atomically (the database queues callers):
   * pause between questions, per-owner and all-owners daily limits. A taken slot stays taken.
   */
  reserveCoach(token: string): Promise<CoachQuota>;
}

export type CoachQuotaStatus = "ok" | "terlalu_cepat" | "batas_harian" | "batas_semua";

/** `used`: this owner's slots today, including the one just taken. */
export interface CoachQuota {
  status: CoachQuotaStatus;
  used: number;
}

/** waTaken: that number is already a participant (its link is never returned). */
export type RegisterResult =
  { ok: true; token: string; code: string } | { ok: false; reason: "waTaken" | "busy" | "failed" };

export interface CoachExchange {
  question: string;
  topic: string | null;
  answer: string;
  /** Provider and model that answered. */
  source: string;
  /** The model said the question is outside the coach's scope (answer = fixed reply). */
  offTopic: boolean;
  usage: AiUsage | null;
}

export type SignInResult =
  { ok: true; user: StaffUser } | { ok: false; reason: "invalid" | "notStaff" };
export type SignUpResult =
  | { ok: true; user: StaffUser }
  | { ok: false; reason: "inviteMismatch" | "exists" | "weakPassword" | "confirmEmail" | "failed" };

export type InviteResult =
  { ok: true; invite: TeamInvite } | { ok: false; reason: "member" | "failed" };

export type QuestionnaireField = "sent" | "done";

/** Research team side: staff session + participants. */
export interface StaffStore {
  currentUser(): Promise<StaffUser | null>;
  signIn(email: string, password: string): Promise<SignInResult>;
  /** Google sign-in address for this team login, or null when not available (mock data). */
  googleSignInUrl(callbackUrl: string): Promise<string | null>;
  /** Completes Google sign-in with the one-time code from the callback. */
  finishGoogleSignIn(code: string): Promise<SignInResult>;
  signUp(input: {
    name: string;
    email: string;
    password: string;
    inviteCode: string;
  }): Promise<SignUpResult>;
  signOut(): Promise<void>;

  listParticipants(): Promise<Participant[]>;
  getParticipant(businessId: string): Promise<Participant | null>;
  createParticipant(input: NewParticipant): Promise<Participant>;
  updateParticipant(businessId: string, input: NewParticipant): Promise<boolean>;
  /** Admin only (RLS "admin menghapus peserta"): answers, pack, events and coach go with it. */
  deleteParticipant(businessId: string): Promise<boolean>;
  setQuestionnaire(
    businessId: string,
    field: QuestionnaireField,
    at: string | null,
  ): Promise<boolean>;
  listEvents(businessId?: string): Promise<ResearchEvent[]>;
  logEvent(businessId: string, action: EventAction, meta: EventMeta | null): Promise<void>;
  /** Coach conversations, oldest first; one participant or everyone (CSV). */
  listCoachMessages(businessId?: string): Promise<CoachMessage[]>;

  /**
   * Gives participants to a team member (null = not assigned). Admin: anyone. Pendamping:
   * only unassigned ones to themselves, or their own back. Returns how many changed.
   */
  assignParticipants(businessIds: string[], staffId: string | null): Promise<number>;
  /** Contact log, newest first; one participant or everyone (list page, CSV). */
  listContactNotes(businessId?: string): Promise<ContactNote[]>;
  /** Written as the signed-in member (the database fills in the author). */
  addContactNote(businessId: string, outcome: ContactOutcome, note: string | null): Promise<void>;
  /** The author or an admin. False when not allowed or already gone. */
  deleteContactNote(noteId: number): Promise<boolean>;

  /** Admin only: coach use per day for the last `days` days, newest refusals. */
  coachUsage(days: number): Promise<CoachUsage>;
  /** Admin only: newest application errors. */
  listErrors(): Promise<ErrorReport[]>;
  /** Admin only: empties the error log. */
  clearErrors(): Promise<void>;

  listTeam(): Promise<{ members: TeamMember[]; invites: TeamInvite[] }>;
  invite(email: string, role: TeamInvite["role"]): Promise<InviteResult>;
  removeInvite(email: string): Promise<boolean>;
  /** Admin only (RLS "admin mengubah peran"). False when no such member. */
  setRole(userId: string, role: TeamMember["role"]): Promise<boolean>;
  /** Admin only, never oneself (RLS "admin mengeluarkan anggota"). The login account stays. */
  removeMember(userId: string): Promise<boolean>;

  /**
   * Admin only: replaces one text of the check or the SOPs (null = back to bank.json).
   * Logged in the text history. Returns the new text version.
   */
  saveTextEdit(target: EditTarget, value: string | null): Promise<number>;
  /** Text edits, newest first. */
  listTextHistory(): Promise<TextEditHistoryItem[]>;
}

/** Admin text edits, read by every page that shows the check or an SOP (public, like the texts). */
export interface TextStore {
  listEdits(): Promise<TextEdit[]>;
}

export interface DataSource {
  owner: OwnerStore;
  staff: StaffStore;
  texts: TextStore;
}
