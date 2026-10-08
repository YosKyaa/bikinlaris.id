import { diagnosisBank } from "@/content/diagnosis";
import { sections } from "@/lib/diagnosis/bank";
import { answeredCount } from "@/lib/diagnosis/scoring";
import { addDays, dayNumber } from "@/lib/format";

import {
  EVENT_ACTIONS,
  type DueGroup,
  type DueItem,
  type FunnelStep,
  type Participant,
  type ParticipantRow,
  type ParticipantStage,
  type ResearchEvent,
} from "./types";

/**
 * Researcher panel figures, computed from participants and the event log only.
 * Pure functions: the same code serves demo data and Supabase.
 */

/** How far ahead "Kirim kuesioner minggu ini" looks. */
export const DUE_WINDOW_DAYS = 7;

export const PARTICIPANT_FILTERS = [
  "semua",
  "siap_dikirim",
  "terkirim",
  "belum_h30",
  "cek_usaha",
  "belum_mulai",
  "selesai",
] as const;
export type ParticipantFilter = (typeof PARTICIPANT_FILTERS)[number];

/** Most urgent first in the table. */
const STAGE_ORDER: Record<ParticipantStage, number> = {
  siap_dikirim: 0,
  terkirim: 1,
  belum_h30: 2,
  cek_usaha: 3,
  belum_mulai: 4,
  selesai: 5,
};

export function participantStage(
  { diagnosis, pack }: Participant,
  today: string,
): ParticipantStage {
  if (pack?.status === "siap") {
    if (pack.questionnaireDoneAt) return "selesai";
    if (pack.questionnaireSentAt) return "terkirim";
    return today >= pack.followUpOn ? "siap_dikirim" : "belum_h30";
  }
  if (pack || answeredCount(diagnosis?.answers ?? {}) > 0) return "cek_usaha";
  return "belum_mulai";
}

export function toRow(participant: Participant, today: string): ParticipantRow {
  const { business, pack } = participant;
  const ready = pack?.status === "siap" ? pack : null;
  return {
    businessId: business.id,
    code: business.code,
    businessName: business.name,
    ownerName: business.ownerName,
    whatsapp: business.whatsapp,
    location: business.location,
    packCreatedOn: ready?.createdOn ?? null,
    dayNumber: ready ? dayNumber(ready.createdOn, today) : null,
    followUpOn: ready?.followUpOn ?? null,
    stage: participantStage(participant, today),
  };
}

export function buildRows(participants: Participant[], today: string): ParticipantRow[] {
  return participants
    .map((participant) => toRow(participant, today))
    .sort(
      (a, b) =>
        STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage] ||
        (b.dayNumber ?? 0) - (a.dayNumber ?? 0) ||
        a.code.localeCompare(b.code),
    );
}

export function countByFilter(rows: ParticipantRow[]): Record<ParticipantFilter, number> {
  const counts = Object.fromEntries(PARTICIPANT_FILTERS.map((f) => [f, 0])) as Record<
    ParticipantFilter,
    number
  >;
  counts.semua = rows.length;
  for (const row of rows) counts[row.stage] += 1;
  return counts;
}

/** Participants per stage, from "Tambah UMKM" to the questionnaire. */
export function buildFunnel(participants: Participant[], today: string): FunnelStep[] {
  const ready = participants.flatMap(({ pack }) => (pack?.status === "siap" ? [pack] : []));
  return [
    { key: "registered", count: participants.length },
    {
      key: "diagnosisStarted",
      count: participants.filter((p) => p.pack || answeredCount(p.diagnosis?.answers ?? {}) > 0)
        .length,
    },
    {
      key: "diagnosisDone",
      count: participants.filter((p) => p.pack || p.diagnosis?.completedAt).length,
    },
    { key: "packsCreated", count: ready.length },
    { key: "pastDay30", count: ready.filter((p) => today >= p.followUpOn).length },
    { key: "questionnaireSent", count: ready.filter((p) => p.questionnaireSentAt).length },
    { key: "questionnaireDone", count: ready.filter((p) => p.questionnaireDoneAt).length },
  ];
}

function dueGroup(followUpOn: string, today: string): DueGroup {
  if (followUpOn < today) return "overdue";
  if (followUpOn === today) return "today";
  if (followUpOn === addDays(today, 1)) return "tomorrow";
  return "later";
}

/** Questionnaire not sent yet, day 30 past or within the next week. Most urgent first. */
export function buildDueList(participants: Participant[], today: string): DueItem[] {
  const horizon = addDays(today, DUE_WINDOW_DAYS);
  return participants
    .flatMap(({ business, pack }): DueItem[] => {
      if (pack?.status !== "siap" || pack.questionnaireSentAt || pack.followUpOn > horizon) {
        return [];
      }
      return [
        {
          businessId: business.id,
          code: business.code,
          businessName: business.name,
          ownerName: business.ownerName,
          whatsapp: business.whatsapp,
          followUpOn: pack.followUpOn,
          dayNumber: dayNumber(pack.createdOn, today),
          group: dueGroup(pack.followUpOn, today),
        },
      ];
    })
    .sort((a, b) => a.followUpOn.localeCompare(b.followUpOn) || a.code.localeCompare(b.code));
}

/* ---------- CSV export (SmartPLS input, joined to SurveyMonkey by `kode`) ---------- */

type Cell = string | number | boolean | null | undefined;

function csvCell(value: Cell): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(header: string[], rows: Cell[][]): string {
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

/** One row per participant: profile, answers per question, map, pack, questionnaire, usage. */
export function summaryCsv(
  participants: Participant[],
  events: ResearchEvent[],
  today: string,
): string {
  const header = [
    "kode",
    "business_id",
    "nama_usaha",
    "nama_pemilik",
    "wa",
    "produk",
    "lokasi",
    "sektor",
    "lama_usaha",
    "jumlah_karyawan",
    "peran",
    "terdaftar",
    "tahap",
    ...diagnosisBank.questions.map((q) => q.id),
    ...sections.flatMap((sec) => [`skor_${sec.id}`, `warna_${sec.id}`]),
    "repot",
    "jumlah_masalah",
    "jumlah_sop",
    "sop",
    "sumber",
    "paket_dibuat",
    "h30",
    "hari_ke",
    "kuesioner_dikirim",
    "kuesioner_selesai",
    "sop_dibuka_unik",
    ...EVENT_ACTIONS.map((a) => `event_${a}`),
  ];
  const rows = participants.map((participant) => {
    const { business: b, diagnosis } = participant;
    const pack = participant.pack?.status === "siap" ? participant.pack : null;
    const own = events.filter((e) => e.businessId === b.id);
    const answers = diagnosis?.answers ?? {};
    const openedSops = new Set(
      own.flatMap((e) =>
        e.action === "sop_buka" && typeof e.meta?.sop === "string" ? [e.meta.sop] : [],
      ),
    );
    return [
      b.code,
      b.id,
      b.name,
      b.ownerName,
      b.whatsapp,
      b.product,
      b.location,
      b.sector,
      b.yearsRunning,
      b.employees,
      b.ownerRole,
      b.createdAt.slice(0, 10),
      participantStage(participant, today),
      ...diagnosisBank.questions.map((q) => answers[q.id] ?? null),
      ...sections.flatMap((sec) =>
        pack ? [pack.map[sec.id].score, pack.map[sec.id].color] : [null, null],
      ),
      pack?.hardestSection ?? null,
      pack?.problems.length ?? null,
      pack?.sops.length ?? null,
      pack ? pack.sops.map((sop) => sop.sopId).join("|") : null,
      pack?.source ?? null,
      pack?.createdOn ?? null,
      pack?.followUpOn ?? null,
      pack ? dayNumber(pack.createdOn, today) : null,
      pack?.questionnaireSentAt ?? null,
      pack?.questionnaireDoneAt ?? null,
      openedSops.size,
      ...EVENT_ACTIONS.map((a) => own.filter((e) => e.action === a).length),
    ];
  });
  return toCsv(header, rows);
}

export function eventsCsv(participants: Participant[], events: ResearchEvent[]): string {
  const codes = new Map(participants.map((p) => [p.business.id, p.business.code]));
  return toCsv(
    ["id", "kode", "business_id", "action", "meta", "created_at"],
    events.map((e) => [
      e.id,
      codes.get(e.businessId) ?? null,
      e.businessId,
      e.action,
      e.meta ? JSON.stringify(e.meta) : null,
      e.createdAt,
    ]),
  );
}
