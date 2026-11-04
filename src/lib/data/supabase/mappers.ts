import "server-only";

import { z } from "zod";

import {
  EMPLOYEE_COUNTS,
  LOCATIONS,
  OWNER_ROLES,
  SECTORS,
  YEARS_RUNNING,
} from "@/lib/validations/business";
import {
  answersSchema,
  mapSchema,
  packSopsSchema,
  problemsSchema,
  sopIdsSchema,
  storedSectionIdSchema,
} from "@/lib/validations/stored";
import { STAFF_ROLES } from "@/lib/validations/auth";
import { toJson } from "@/lib/json";
import { LEGACY_LOCATIONS } from "@/lib/wilayah";
import type { Json, TableRow } from "@/types/database";

import { ERROR_SOURCES, type ErrorReport } from "@/lib/monitoring/types";

import {
  COACH_ROLES,
  CONTACT_OUTCOMES,
  EVENT_ACTIONS,
  SIGNUP_VIAS,
  type Business,
  type CoachMessage,
  type CoachTurn,
  type CoachUsage,
  type ContactNote,
  type Diagnosis,
  type EventMeta,
  type NewParticipant,
  type Pack,
  type ResearchEvent,
  type StaffUser,
  type TeamInvite,
} from "../types";

/** Row ⇄ domain mapping. Column names follow the database (Indonesian), the app uses English. */

const businessRowSchema = z.object({
  id: z.string(),
  kode: z.string(),
  nama: z.string(),
  pemilik: z.string(),
  wa: z.string(),
  produk: z.string(),
  // Rows from before the Kemendagri codes (if the migration has not run yet) read as their code.
  lokasi: z.preprocess(
    (value) => (typeof value === "string" ? (LEGACY_LOCATIONS[value] ?? value) : value),
    z.enum(LOCATIONS),
  ),
  sektor: z.enum(SECTORS),
  lama_usaha: z.enum(YEARS_RUNNING),
  jumlah_karyawan: z.enum(EMPLOYEE_COUNTS),
  peran: z.enum(OWNER_ROLES),
  created_at: z.string(),
  /** Staff rows only: umkm_state strips it from the owner's view. */
  created_by: z.string().nullable().optional(),
  /** Staff rows only; missing before migration 20261104000000. */
  pendamping_id: z.string().nullable().optional(),
  /** Missing on databases from before the self-registration migration. */
  daftar_via: z.enum(SIGNUP_VIAS).optional(),
});

export function toBusiness(row: unknown): Business {
  const r = businessRowSchema.parse(row);
  return {
    id: r.id,
    code: r.kode,
    name: r.nama,
    ownerName: r.pemilik,
    whatsapp: r.wa,
    product: r.produk,
    location: r.lokasi,
    sector: r.sektor,
    yearsRunning: r.lama_usaha,
    employees: r.jumlah_karyawan,
    ownerRole: r.peran,
    createdAt: r.created_at,
    createdBy: r.created_by ?? null,
    assignedTo: r.pendamping_id ?? null,
    signupVia: r.daftar_via ?? "pendamping",
  };
}

export function fromParticipant(input: NewParticipant) {
  return {
    nama: input.name,
    pemilik: input.ownerName,
    wa: input.whatsapp,
    produk: input.product,
    lokasi: input.location,
    sektor: input.sector,
    lama_usaha: input.yearsRunning,
    jumlah_karyawan: input.employees,
    peran: input.ownerRole,
  };
}

const diagnosisRowSchema = z.object({
  id: z.string(),
  business_id: z.string(),
  jawaban: answersSchema,
  repot: storedSectionIdSchema.nullable(),
  started_at: z.string(),
  completed_at: z.string().nullable(),
});

export function toDiagnosis(row: unknown): Diagnosis {
  const r = diagnosisRowSchema.parse(row);
  return {
    id: r.id,
    businessId: r.business_id,
    answers: r.jawaban,
    hardestSection: r.repot,
    startedAt: r.started_at,
    completedAt: r.completed_at,
  };
}

const packRowSchema = z.object({
  id: z.string(),
  business_id: z.string(),
  diagnosa_id: z.string(),
  repot: storedSectionIdSchema,
  peta: mapSchema,
  masalah: problemsSchema,
  sops: packSopsSchema,
  sop_lain: sopIdsSchema,
  dibuat: z.string(),
  h30: z.string(),
  status: z.enum(["menyusun", "siap"]),
  sumber: z.enum(["template", "llm"]),
  generation_started_at: z.string(),
  kuesioner_dikirim_at: z.string().nullable(),
  kuesioner_selesai_at: z.string().nullable(),
});

export function toPack(row: unknown): Pack {
  const r = packRowSchema.parse(row);
  return {
    id: r.id,
    businessId: r.business_id,
    diagnosisId: r.diagnosa_id,
    hardestSection: r.repot,
    map: r.peta,
    problems: r.masalah,
    sops: r.sops,
    laterSopIds: r.sop_lain,
    createdOn: r.dibuat,
    followUpOn: r.h30,
    source: r.sumber,
    status: r.status,
    generationStartedAt: r.generation_started_at,
    questionnaireSentAt: r.kuesioner_dikirim_at,
    questionnaireDoneAt: r.kuesioner_selesai_at,
  };
}

const metaValue = z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()]);
const eventRowSchema = z.object({
  id: z.number(),
  business_id: z.string(),
  action: z.enum(EVENT_ACTIONS),
  meta: z.record(z.string(), metaValue).nullable(),
  created_at: z.string(),
});

export function toEvent(row: TableRow<"events">): ResearchEvent {
  const r = eventRowSchema.parse(row);
  return {
    id: r.id,
    businessId: r.business_id,
    action: r.action,
    meta: r.meta,
    createdAt: r.created_at,
  };
}

const staffRowSchema = z.object({
  user_id: z.string(),
  email: z.string(),
  nama: z.string().nullable(),
  role: z.enum(STAFF_ROLES),
});

const coachTurnSchema = z.object({
  id: z.number(),
  peran: z.enum(COACH_ROLES),
  isi: z.string(),
  created_at: z.string(),
});

/** One message from umkm_coach_riwayat (owner view: no source or topic). */
export function toCoachTurn(row: unknown): CoachTurn {
  const r = coachTurnSchema.parse(row);
  return { id: r.id, role: r.peran, text: r.isi, createdAt: r.created_at };
}

const coachMessageSchema = coachTurnSchema.extend({
  business_id: z.string(),
  topik: z.string().nullable(),
  sumber: z.string().nullable(),
});

export function toCoachMessage(row: TableRow<"coach_pesan">): CoachMessage {
  const r = coachMessageSchema.parse(row);
  return {
    id: r.id,
    role: r.peran,
    text: r.isi,
    createdAt: r.created_at,
    businessId: r.business_id,
    topic: r.topik,
    source: r.sumber,
  };
}

export function toStaff(row: TableRow<"staff">): StaffUser {
  const r = staffRowSchema.parse(row);
  return { id: r.user_id, email: r.email, name: r.nama, role: r.role };
}

const inviteRowSchema = z.object({
  email: z.string(),
  role: z.enum(STAFF_ROLES),
  kode: z.string(),
});

export function toInvite(row: TableRow<"staff_invites">): TeamInvite {
  const r = inviteRowSchema.parse(row);
  return { email: r.email, role: r.role, code: r.kode };
}

const contactRowSchema = z.object({
  id: z.number(),
  business_id: z.string(),
  staff_id: z.string().nullable(),
  hasil: z.enum(CONTACT_OUTCOMES),
  catatan: z.string().nullable(),
  created_at: z.string(),
});

export function toContactNote(row: TableRow<"kontak_catatan">): ContactNote {
  const r = contactRowSchema.parse(row);
  return {
    id: r.id,
    businessId: r.business_id,
    staffId: r.staff_id,
    outcome: r.hasil,
    note: r.catatan,
    createdAt: r.created_at,
  };
}

const usageSchema = z.object({
  hari: z.array(
    z.object({
      tanggal: z.string(),
      jatah: z.number(),
      dijawab: z.number(),
      di_luar_topik: z.number(),
      gagal: z.number(),
      ditolak: z.number(),
      token_masuk: z.number(),
      token_keluar: z.number(),
    }),
  ),
  ditolak_terbaru: z.array(
    z.object({
      kode: z.string(),
      business_id: z.string(),
      isi: z.string(),
      created_at: z.string(),
    }),
  ),
});

/** Result of tim_pemakaian_coach. */
export function toCoachUsage(value: unknown): CoachUsage {
  const r = usageSchema.parse(value);
  return {
    days: r.hari.map((d) => ({
      date: d.tanggal,
      reserved: d.jatah,
      answered: d.dijawab,
      offTopic: d.di_luar_topik,
      failed: d.gagal,
      refused: d.ditolak,
      inputTokens: d.token_masuk,
      outputTokens: d.token_keluar,
    })),
    latestRefusals: r.ditolak_terbaru.map((x) => ({
      businessId: x.business_id,
      code: x.kode,
      text: x.isi,
      createdAt: x.created_at,
    })),
  };
}

const errorRowSchema = z.object({
  sumber: z.enum(ERROR_SOURCES),
  pesan: z.string(),
  digest: z.string().nullable(),
  jalur: z.string().nullable(),
  konteks: z.string().nullable(),
  created_at: z.string(),
});

export function toErrorReport(row: TableRow<"galat">): ErrorReport {
  const r = errorRowSchema.parse(row);
  return {
    source: r.sumber,
    message: r.pesan,
    digest: r.digest,
    path: r.jalur,
    context: r.konteks,
    at: r.created_at,
  };
}

export function metaToJson(meta: EventMeta | null): Json {
  return meta === null ? null : toJson(meta);
}
