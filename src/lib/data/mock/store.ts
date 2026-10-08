import "server-only";

import { randomUUID } from "node:crypto";

import type { QuestionId, SectionId } from "@/content/diagnosis";
import type { StoredAnswer } from "@/content/diagnosis.types";
import { rules } from "@/lib/diagnosis/bank";
import { buildPack } from "@/lib/diagnosis/scoring";
import { addDays, todayIso } from "@/lib/format";
import type { BusinessProfile } from "@/lib/validations/business";

import type {
  Answers,
  Business,
  Diagnosis,
  EventAction,
  Pack,
  ResearchEvent,
  StaffRole,
  TeamInvite,
} from "../types";

/**
 * In-memory demo data (DATA_SOURCE=mock). Lives on globalThis so it survives dev hot reloads;
 * resets when the server restarts. Every function in lib/data/mock/* reads and writes here.
 */

export const MOCK_PASSWORD = "bikinlaris";
export const MOCK_DEMO_TOKEN = "demo";
export const MOCK_FRESH_TOKEN = "coba";
export const MOCK_INVITE: TeamInvite = {
  email: "enumerator.baru@bikinlaris.id",
  role: "enumerator",
  code: "a1b2c3d4",
};

export interface MockStaff {
  id: string;
  email: string;
  name: string | null;
  role: StaffRole;
  password: string;
}

interface MockStore {
  staff: Map<string, MockStaff>;
  invites: Map<string, TeamInvite>;
  businesses: Map<string, Business>;
  /** Private link token → business id. */
  tokens: Map<string, string>;
  diagnoses: Map<string, Diagnosis>;
  packs: Map<string, Pack>;
  events: ResearchEvent[];
  nextEventId: number;
  nextCode: number;
}

const globalForStore = globalThis as typeof globalThis & { __bikinlarisMock?: MockStore };

export function store(): MockStore {
  globalForStore.__bikinlarisMock ??= seed();
  return globalForStore.__bikinlarisMock;
}

export const newId = () => randomUUID();

const CODE_DIGITS = 3;
export function nextCode(s: MockStore): string {
  return `BL-${String(s.nextCode++).padStart(CODE_DIGITS, "0")}`;
}

export function tokenOf(s: MockStore, businessId: string): string {
  for (const [token, id] of s.tokens) if (id === businessId) return token;
  throw new Error(`Tautan untuk ${businessId} tidak ada.`);
}

export function pushEvent(
  s: MockStore,
  businessId: string,
  action: EventAction,
  meta: ResearchEvent["meta"],
  createdAt = new Date().toISOString(),
): void {
  s.events.push({ id: s.nextEventId++, businessId, action, meta, createdAt });
}

/* ---------- seed ---------- */

/** Demo answers from prototype/index.html `loadDemo` ("Dapur Bu Rini"). */
const DEMO_ANSWERS: Record<QuestionId, StoredAnswer> = {
  q_pesanan_1: "belum",
  q_pesanan_2: "kadang",
  q_pesanan_3: "belum",
  q_pesanan_4: "kadang",
  q_pesanan_5: "ya",
  q_produksi_1: "ya",
  q_produksi_2: "kadang",
  q_produksi_3: "ya",
  q_produksi_4: "ya",
  q_produksi_5: "belum",
  q_stok_1: "kadang",
  q_stok_2: "kadang",
  q_stok_3: "belum",
  q_stok_4: "ya",
  q_stok_5: "ya",
  q_uang_1: "belum",
  q_uang_2: "kadang",
  q_uang_3: "belum",
  q_uang_4: "belum",
  q_uang_5: "lewati",
  q_promosi_1: "kadang",
  q_promosi_2: "ya",
  q_promosi_3: "belum",
  q_promosi_4: "ya",
  q_promosi_5: "ya",
  q_antar_1: "ya",
  q_antar_2: "ya",
  q_antar_3: "ya",
  q_antar_4: "kadang",
  q_antar_5: "belum",
};

/** A second answer pattern so dashboard rows differ. */
const ALT_ANSWERS: Answers = Object.fromEntries(
  Object.entries(DEMO_ANSWERS).map(([key, value], index) => [
    key,
    index % 3 === 0 ? "kadang" : value === "ya" ? "belum" : "ya",
  ]),
);

/** First two sections only: a diagnosis that was started and not finished. */
const PARTIAL_ANSWERS: Answers = Object.fromEntries(
  Object.entries(DEMO_ANSWERS).filter(([key]) => /^q_(pesanan|produksi)_/.test(key)),
);

const DEMO_PROFILE: BusinessProfile = {
  name: "Dapur Bu Rini",
  product: "nasi box",
  location: "depok",
  sector: "kuliner",
  yearsRunning: "3_5",
  employees: "1_4",
  ownerRole: "pemilik",
};

interface SeedBusiness {
  token: string;
  ownerName: string;
  profile: BusinessProfile;
  answers?: Answers;
  hardest?: SectionId;
  packDaysAgo?: number;
  sentDaysAgo?: number;
  done?: boolean;
}

/** Example participants. The researcher panel flags them as demo data. */
const SEED: SeedBusiness[] = [
  {
    token: MOCK_DEMO_TOKEN,
    ownerName: "Rini",
    profile: DEMO_PROFILE,
    answers: DEMO_ANSWERS,
    hardest: "uang",
    packDaysAgo: 12,
  },
  {
    token: "sari",
    ownerName: "Sari",
    profile: {
      ...DEMO_PROFILE,
      name: "Katering Mbak Sari",
      product: "katering harian",
      location: "bekasi",
    },
    answers: ALT_ANSWERS,
    hardest: "pesanan",
    packDaysAgo: 34,
  },
  {
    token: "udin",
    ownerName: "Udin",
    profile: {
      ...DEMO_PROFILE,
      name: "Jahit Pak Udin",
      product: "jahit dan permak",
      sector: "jasa",
      location: "kota_bogor",
      employees: "tanpa",
    },
    answers: DEMO_ANSWERS,
    hardest: "antar",
    packDaysAgo: 31,
    sentDaysAgo: 1,
  },
  {
    token: "ani",
    ownerName: "Ani",
    profile: {
      ...DEMO_PROFILE,
      name: "Kue Nenek Ani",
      product: "kue basah",
      sector: "produksi_rumahan",
      location: "kab_bogor",
    },
    answers: ALT_ANSWERS,
    hardest: "stok",
    packDaysAgo: 30,
  },
  {
    token: "makmur",
    ownerName: "Hasan",
    profile: {
      ...DEMO_PROFILE,
      name: "Toko Kelontong Makmur",
      product: "sembako",
      sector: "retail",
      yearsRunning: "lebih_5",
    },
    answers: DEMO_ANSWERS,
    hardest: "stok",
    packDaysAgo: 25,
  },
  {
    token: "darto",
    ownerName: "Darto",
    profile: {
      ...DEMO_PROFILE,
      name: "Warung Kopi Pak Darto",
      product: "kopi dan gorengan",
      location: "bekasi",
      employees: "tanpa",
    },
    answers: ALT_ANSWERS,
    hardest: "uang",
    packDaysAgo: 40,
    sentDaysAgo: 9,
    done: true,
  },
  {
    token: "wati",
    ownerName: "Wati",
    profile: { ...DEMO_PROFILE, name: "Laundry Bu Wati", product: "cuci kiloan", sector: "jasa" },
    answers: PARTIAL_ANSWERS,
  },
  {
    token: MOCK_FRESH_TOKEN,
    ownerName: "Mira",
    profile: { ...DEMO_PROFILE, name: "Seblak Teh Mira", product: "seblak", location: "bekasi" },
  },
];

const SEED_ID_PREFIX = "00000000-0000-4000-8000-";
const SEED_ID_DIGITS = 12;
const seedId = (n: number) => SEED_ID_PREFIX + String(n).padStart(SEED_ID_DIGITS, "0");
const at = (date: string, time: string) => `${date}T${time}:00+07:00`;

function seed(): MockStore {
  const s: MockStore = {
    staff: new Map(),
    invites: new Map([[MOCK_INVITE.email, MOCK_INVITE]]),
    businesses: new Map(),
    tokens: new Map(),
    diagnoses: new Map(),
    packs: new Map(),
    events: [],
    nextEventId: 1,
    nextCode: 1,
  };
  const today = todayIso();

  for (const [index, member] of [
    { email: "peneliti@bikinlaris.id", name: "Tim Lapangan", role: "enumerator" as const },
    { email: "admin@bikinlaris.id", name: "Admin Penelitian", role: "admin" as const },
  ].entries()) {
    s.staff.set(member.email, { ...member, id: seedId(900 + index), password: MOCK_PASSWORD });
  }

  SEED.forEach((item, index) => {
    const businessId = seedId(index + 1);
    const joinedOn = addDays(today, -((item.packDaysAgo ?? 2) + 1));
    s.businesses.set(businessId, {
      ...item.profile,
      id: businessId,
      code: nextCode(s),
      ownerName: item.ownerName,
      whatsapp: `6281200000${String(index + 1).padStart(3, "0")}`,
      createdAt: at(joinedOn, "09:00"),
    });
    s.tokens.set(item.token, businessId);
    pushEvent(
      s,
      businessId,
      "profil_selesai",
      { sektor: item.profile.sector },
      at(joinedOn, "09:00"),
    );
    if (!item.answers) return;

    const startedOn =
      item.packDaysAgo === undefined ? addDays(today, -1) : addDays(today, -item.packDaysAgo);
    const diagnosisId = seedId(100 + index);
    const complete = Boolean(item.hardest && item.packDaysAgo !== undefined);
    s.diagnoses.set(businessId, {
      id: diagnosisId,
      businessId,
      answers: item.answers,
      hardestSection: complete ? (item.hardest ?? null) : null,
      startedAt: at(startedOn, "09:10"),
      completedAt: complete ? at(startedOn, "09:18") : null,
    });
    pushEvent(s, businessId, "login", null, at(startedOn, "09:05"));
    pushEvent(s, businessId, "diagnosa_mulai", null, at(startedOn, "09:10"));
    if (!item.hardest || item.packDaysAgo === undefined) return;

    const built = buildPack(item.answers, item.hardest);
    s.packs.set(businessId, {
      id: seedId(200 + index),
      businessId,
      diagnosisId,
      hardestSection: item.hardest,
      ...built,
      createdOn: startedOn,
      followUpOn: addDays(startedOn, rules.followUpDays),
      source: "template",
      status: "siap",
      generationStartedAt: at(startedOn, "09:18"),
      questionnaireSentAt:
        item.sentDaysAgo === undefined ? null : at(addDays(today, -item.sentDaysAgo), "10:00"),
      questionnaireDoneAt:
        item.done && item.sentDaysAgo !== undefined
          ? at(addDays(today, -item.sentDaysAgo + 1), "15:00")
          : null,
    });
    for (const action of ["diagnosa_selesai", "paket_dibuat", "hasil_buka", "kirim_wa"] as const) {
      pushEvent(s, businessId, action, null, at(startedOn, "09:18"));
    }
  });
  return s;
}
