import type { QuestionId, SectionId, SopId } from "@/content/diagnosis";
import type { StoredAnswer } from "@/content/diagnosis.types";
import type { Json } from "@/types/database";

import type {
  BusinessMap,
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
  /** Returns `first: true` for the first answer of a diagnosis (event `diagnosa_mulai`). */
  saveAnswer(
    token: string,
    questionId: QuestionId,
    answer: StoredAnswer,
  ): Promise<{ first: boolean }>;
  /** Closes the diagnosis and creates the pack (status "menyusun"). Idempotent. */
  startPack(token: string, input: PackStart): Promise<Pack>;
  /** Stores the final SOP texts and marks the pack "siap". Idempotent. */
  finishPack(token: string, result: PackResult): Promise<Pack>;
  /** "Ulang cek usaha": answers and pack are removed, the event log stays. */
  reset(token: string): Promise<void>;
  /** Passive research log. `hasil_buka` is stored at most once per day. */
  log(token: string, action: EventAction, meta: EventMeta | null): Promise<void>;
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
  setQuestionnaire(
    businessId: string,
    field: QuestionnaireField,
    at: string | null,
  ): Promise<boolean>;
  listEvents(businessId?: string): Promise<ResearchEvent[]>;
  logEvent(businessId: string, action: EventAction, meta: EventMeta | null): Promise<void>;

  listTeam(): Promise<{ members: TeamMember[]; invites: TeamInvite[] }>;
  invite(email: string, role: TeamInvite["role"]): Promise<InviteResult>;
  removeInvite(email: string): Promise<boolean>;
}

export interface DataSource {
  owner: OwnerStore;
  staff: StaffStore;
}
