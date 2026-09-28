import "server-only";

import { diagnosisBank } from "@/content/diagnosis";
import { sections } from "@/lib/diagnosis/bank";
import { addDays, dayNumber, todayIso } from "@/lib/format";

import { store } from "./mock-store";
import {
  EVENT_ACTIONS,
  type Business,
  type Diagnosis,
  type DueGroup,
  type DueItem,
  type FollowupRow,
  type FollowupStatus,
  type FunnelStep,
  type Pack,
  type ResearchEvent,
} from "./types";

/** How far ahead "Hubungi minggu ini" looks. */
export const DUE_WINDOW_DAYS = 7;

export const FOLLOWUP_FILTERS = [
  "semua",
  "siap_dihubungi",
  "sudah_dihubungi",
  "belum_h30",
] as const;
export type FollowupFilter = (typeof FOLLOWUP_FILTERS)[number];

function followupStatus(pack: Pack, today: string): FollowupStatus {
  if (pack.contactedAt) return "sudah_dihubungi";
  return today >= pack.followUpOn ? "siap_dihubungi" : "belum_h30";
}

/** Participants per stage, from account creation to questionnaire. Counted from data only. */
export async function getFunnel(): Promise<FunnelStep[]> {
  const s = store();
  const today = todayIso();
  const diagnoses = [...s.diagnoses.values()];
  const packs = [...s.packs.values()].filter((p) => p.status === "siap");
  return [
    { key: "registered", count: [...s.users.values()].filter((u) => u.role === "pemilik").length },
    { key: "profileDone", count: s.businesses.size },
    {
      key: "diagnosisStarted",
      count: diagnoses.filter((d) => Object.keys(d.answers).length > 0).length,
    },
    { key: "diagnosisDone", count: diagnoses.filter((d) => d.completedAt).length },
    { key: "packsCreated", count: packs.length },
    { key: "pastDay30", count: packs.filter((p) => today >= p.followUpOn).length },
    { key: "contacted", count: packs.filter((p) => p.contactedAt).length },
    // The questionnaire module does not exist yet: shown as "—", never as 0.
    { key: "questionnaires", count: null },
  ];
}

function dueGroup(followUpOn: string, today: string): DueGroup {
  if (followUpOn < today) return "overdue";
  if (followUpOn === today) return "today";
  if (followUpOn === addDays(today, 1)) return "tomorrow";
  return "later";
}

/** Not-yet-contacted participants whose day 30 is past or within the next week, most urgent first. */
export async function listDueSoon(): Promise<DueItem[]> {
  const s = store();
  const today = todayIso();
  const horizon = addDays(today, DUE_WINDOW_DAYS);
  const items: DueItem[] = [];
  for (const pack of s.packs.values()) {
    const business = s.businesses.get(pack.businessId);
    if (!business || pack.status !== "siap" || pack.contactedAt || pack.followUpOn > horizon) {
      continue;
    }
    items.push({
      businessId: business.id,
      businessName: business.name,
      email: business.email,
      followUpOn: pack.followUpOn,
      dayNumber: dayNumber(pack.createdOn, today),
      group: dueGroup(pack.followUpOn, today),
    });
  }
  return items.sort((a, b) => a.followUpOn.localeCompare(b.followUpOn));
}

/** Rows sorted so the most overdue, not yet contacted participants come first. */
export async function listFollowups(filter: FollowupFilter): Promise<FollowupRow[]> {
  const s = store();
  const today = todayIso();
  const order: Record<FollowupStatus, number> = {
    siap_dihubungi: 0,
    belum_h30: 1,
    sudah_dihubungi: 2,
  };
  const rows: FollowupRow[] = [];
  for (const pack of s.packs.values()) {
    const business = s.businesses.get(pack.businessId);
    if (!business || pack.status !== "siap") continue;
    rows.push({
      businessId: business.id,
      businessName: business.name,
      email: business.email,
      location: business.location,
      packCreatedOn: pack.createdOn,
      dayNumber: dayNumber(pack.createdOn, today),
      followUpOn: pack.followUpOn,
      status: followupStatus(pack, today),
      questionnaireDone: pack.questionnaireDone,
    });
  }
  return rows
    .filter((row) => filter === "semua" || row.status === filter)
    .sort((a, b) => order[a.status] - order[b.status] || b.dayNumber - a.dayNumber);
}

export interface BusinessDetail {
  business: Business;
  diagnosis: Diagnosis | null;
  pack: Pack | null;
  events: ResearchEvent[];
}

export async function getBusinessDetail(businessId: string): Promise<BusinessDetail | null> {
  const s = store();
  const business = s.businesses.get(businessId);
  if (!business) return null;
  return {
    business,
    diagnosis: s.diagnoses.get(businessId) ?? null,
    pack: s.packs.get(businessId) ?? null,
    events: s.events.filter((e) => e.businessId === businessId).reverse(),
  };
}

/* ---------- CSV export (SmartPLS input, FASE.md fase 3) ---------- */

function csvCell(value: string | number | boolean | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(header: string[], rows: (string | number | boolean | null)[][]): string {
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

/** One row per business: profile, answers per question, map per section, counts, events per action. */
export async function exportSummaryCsv(): Promise<string> {
  const s = store();
  const today = todayIso();
  const header = [
    "business_id",
    "nama",
    "email",
    "produk",
    "lokasi",
    "sektor",
    "lama_usaha",
    "jumlah_karyawan",
    "peran",
    ...diagnosisBank.questions.map((q) => q.id),
    ...sections.flatMap((sec) => [`skor_${sec.id}`, `warna_${sec.id}`]),
    "repot",
    "jumlah_masalah",
    "jumlah_sop",
    "sop",
    "paket_dibuat",
    "h30",
    "hari_ke",
    "sumber",
    "dihubungi",
    ...EVENT_ACTIONS.map((a) => `event_${a}`),
  ];
  const rows = [...s.businesses.values()].map((b) => {
    const pack = s.packs.get(b.id);
    const events = s.events.filter((e) => e.businessId === b.id);
    const answers = s.diagnoses.get(b.id)?.answers ?? {};
    return [
      b.id,
      b.name,
      b.email,
      b.product,
      b.location,
      b.sector,
      b.yearsRunning,
      b.employees,
      b.ownerRole,
      ...diagnosisBank.questions.map((q) => answers[q.id] ?? null),
      ...sections.flatMap((sec) =>
        pack ? [pack.map[sec.id].score, pack.map[sec.id].color] : [null, null],
      ),
      pack?.hardestSection ?? null,
      pack?.problems.length ?? null,
      pack?.sops.length ?? null,
      pack ? pack.sops.map((sop) => sop.sopId).join("|") : null,
      pack?.createdOn ?? null,
      pack?.followUpOn ?? null,
      pack ? dayNumber(pack.createdOn, today) : null,
      pack?.source ?? null,
      pack?.contactedAt ?? null,
      ...EVENT_ACTIONS.map((a) => events.filter((e) => e.action === a).length),
    ];
  });
  return toCsv(header, rows);
}

export async function exportEventsCsv(): Promise<string> {
  const events = store().events;
  return toCsv(
    ["id", "business_id", "action", "meta", "created_at"],
    events.map((e) => [
      e.id,
      e.businessId,
      e.action,
      e.meta ? JSON.stringify(e.meta) : null,
      e.createdAt,
    ]),
  );
}
