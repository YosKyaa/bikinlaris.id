import "server-only";

import { randomUUID } from "node:crypto";

import type { QuestionId, SectionId } from "@/content/diagnosis";
import { isMockData } from "@/lib/env";
import { buildPack } from "@/lib/diagnosis/scoring";
import { addDays, todayIso } from "@/lib/format";
import { rules } from "@/lib/diagnosis/bank";
import type { StoredAnswer } from "@/content/diagnosis.types";
import type { BusinessProfile } from "@/lib/validations/business";

import type { Answers, Business, Diagnosis, Pack, ResearchEvent, Role } from "./types";

/**
 * In-memory typed store used while the Supabase schema does not exist (DATA_SOURCE=mock).
 * Lives on globalThis so it survives dev hot reloads; resets on server restart.
 * The functions in lib/data/*.ts are the swap point: replace their bodies with Supabase
 * queries without changing components.
 */

export const MOCK_PASSWORD = "bikinlaris";

export interface MockUser {
  id: string;
  email: string;
  password: string;
  role: Role;
  businessId: string | null;
}

interface MockStore {
  users: Map<string, MockUser>;
  businesses: Map<string, Business>;
  diagnoses: Map<string, Diagnosis>;
  packs: Map<string, Pack>;
  events: ResearchEvent[];
  nextEventId: number;
  /** Business name typed by the enumerator when creating an account, prefills the profile. */
  prefilledNames: Map<string, string>;
}

const globalForStore = globalThis as typeof globalThis & { __bikinlarisStore?: MockStore };

export function store(): MockStore {
  if (!isMockData) {
    throw new Error("Lapisan data Supabase belum dibuat. Pakai DATA_SOURCE=mock untuk sekarang.");
  }
  globalForStore.__bikinlarisStore ??= seed();
  return globalForStore.__bikinlarisStore;
}

export const newId = () => randomUUID();

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

interface SeedBusiness {
  email: string;
  profile: BusinessProfile;
  answers?: Answers;
  hardest?: SectionId;
  packDaysAgo?: number;
  contacted?: boolean;
}

const DEMO_PROFILE: BusinessProfile = {
  name: "Dapur Bu Rini",
  product: "nasi box",
  location: "depok",
  sector: "kuliner",
  yearsRunning: "3_5",
  employees: "1_4",
  ownerRole: "pemilik",
};

/** Example participants for the researcher panel. Clearly flagged as mock data in the UI. */
const SEED_BUSINESSES: SeedBusiness[] = [
  {
    email: "demo@bikinlaris.id",
    profile: DEMO_PROFILE,
    answers: DEMO_ANSWERS,
    hardest: "uang",
    packDaysAgo: 12,
  },
  {
    email: "katering.sari@contoh.id",
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
    email: "jahit.pak.udin@contoh.id",
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
    contacted: true,
  },
  {
    email: "kue.nenek@contoh.id",
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
    email: "toko.berkah@contoh.id",
    profile: {
      ...DEMO_PROFILE,
      name: "Toko Kelontong Makmur",
      product: "sembako",
      sector: "retail",
      location: "depok",
      yearsRunning: "lebih_5",
    },
    answers: DEMO_ANSWERS,
    hardest: "stok",
    packDaysAgo: 5,
  },
  {
    email: "baru.daftar@contoh.id",
    profile: { ...DEMO_PROFILE, name: "Seblak Teh Mira", product: "seblak", location: "bekasi" },
  },
];

function seed(): MockStore {
  const s: MockStore = {
    users: new Map(),
    businesses: new Map(),
    diagnoses: new Map(),
    packs: new Map(),
    events: [],
    nextEventId: 1,
    prefilledNames: new Map(),
  };
  const today = todayIso();

  s.users.set("coba@bikinlaris.id", {
    id: newId(),
    email: "coba@bikinlaris.id",
    password: MOCK_PASSWORD,
    role: "pemilik",
    businessId: null,
  });
  s.users.set("peneliti@bikinlaris.id", {
    id: newId(),
    email: "peneliti@bikinlaris.id",
    password: MOCK_PASSWORD,
    role: "enumerator",
    businessId: null,
  });

  for (const item of SEED_BUSINESSES) {
    const businessId = newId();
    const createdOn = addDays(today, -((item.packDaysAgo ?? 0) + 1));
    s.businesses.set(businessId, {
      ...item.profile,
      id: businessId,
      email: item.email,
      createdAt: `${createdOn}T09:00:00+07:00`,
    });
    s.users.set(item.email, {
      id: newId(),
      email: item.email,
      password: MOCK_PASSWORD,
      role: "pemilik",
      businessId,
    });
    if (!item.answers || !item.hardest || item.packDaysAgo === undefined) continue;

    const packDate = addDays(today, -item.packDaysAgo);
    const diagnosisId = newId();
    s.diagnoses.set(businessId, {
      id: diagnosisId,
      businessId,
      answers: item.answers,
      hardestSection: item.hardest,
      startedAt: `${packDate}T09:10:00+07:00`,
      completedAt: `${packDate}T09:18:00+07:00`,
    });
    const built = buildPack(item.answers, item.hardest);
    s.packs.set(businessId, {
      id: newId(),
      businessId,
      diagnosisId,
      hardestSection: item.hardest,
      ...built,
      createdOn: packDate,
      followUpOn: addDays(packDate, rules.followUpDays),
      source: "template",
      status: "siap",
      generationStartedAt: `${packDate}T09:18:00+07:00`,
      contactedAt: item.contacted ? `${today}T10:00:00+07:00` : null,
      questionnaireDone: false,
    });
    for (const action of [
      "login",
      "profil_selesai",
      "diagnosa_mulai",
      "diagnosa_selesai",
      "paket_dibuat",
      "hasil_buka",
    ] as const) {
      s.events.push({
        id: s.nextEventId++,
        businessId,
        action,
        meta: null,
        createdAt: `${packDate}T09:18:00+07:00`,
      });
    }
  }
  return s;
}
