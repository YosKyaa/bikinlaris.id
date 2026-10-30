import "server-only";

import { diagnosisBank, type SectionId } from "@/content/diagnosis";
import type { StoredAnswer } from "@/content/diagnosis.types";
import { rules } from "@/lib/diagnosis/bank";
import { buildPack, computeMap, hardestCandidates } from "@/lib/diagnosis/scoring";
import { addDays, daysBetween } from "@/lib/format";
import {
  EMPLOYEE_COUNTS,
  LOCATIONS,
  OWNER_ROLES,
  SECTORS,
  YEARS_RUNNING,
  type BusinessProfile,
} from "@/lib/validations/business";

import type { Answers, EventAction, EventMeta } from "../types";

/**
 * Extra demo participants for DATA_SOURCE=mock, so the monitoring page has enough rows to read.
 * Deterministic (seeded), spread over the last eight weeks. Never used with real data.
 */

const COHORT: [business: string, product: string, owner: string][] = [
  ["Bakso Mas Joko", "bakso", "Joko"],
  ["Warung Nasi Bu Ijah", "nasi rames", "Ijah"],
  ["Toko Kue Lestari", "kue kering", "Lestari"],
  ["Sablon Kaos Bima", "sablon kaos", "Bima"],
  ["Keripik Pedas Nurul", "keripik", "Nurul"],
  ["Pecel Lele Cak Mat", "pecel lele", "Mat"],
  ["Jamu Gendong Mbok Sri", "jamu", "Sri"],
  ["Toko Plastik Berkah", "plastik kemasan", "Yusuf"],
  ["Martabak Bang Rudi", "martabak", "Rudi"],
  ["Salon Bu Dewi", "potong rambut", "Dewi"],
  ["Es Teh Segar Fajar", "es teh", "Fajar"],
  ["Bengkel Motor Agus", "servis motor", "Agus"],
  ["Ayam Geprek Rina", "ayam geprek", "Rina"],
  ["Konveksi Pak Herman", "seragam sekolah", "Herman"],
  ["Rujak Buah Bu Tini", "rujak", "Tini"],
  ["Sayur Segar Pak Slamet", "sayuran", "Slamet"],
  ["Roti Bakar Dika", "roti bakar", "Dika"],
  ["Catering Bu Yanti", "katering kantor", "Yanti"],
  ["Toko Bangunan Sinar", "bahan bangunan", "Hendra"],
  ["Soto Betawi Haji Ali", "soto betawi", "Ali"],
  ["Kerajinan Rotan Wawan", "kerajinan rotan", "Wawan"],
  ["Nasi Uduk Mpok Ati", "nasi uduk", "Ati"],
  ["Cuci Sepatu Rangga", "cuci sepatu", "Rangga"],
  ["Mie Ayam Pak Kumis", "mie ayam", "Kumis"],
  ["Batik Tulis Bu Endang", "batik tulis", "Endang"],
  ["Dimsum Mama Lia", "dimsum", "Lia"],
  ["Fotokopi Cahaya", "fotokopi", "Imam"],
  ["Sate Madura Cak Huda", "sate", "Huda"],
];

const COHORT_SPAN_DAYS = 56;
const SHARE_NOT_STARTED = 0.08;
const SHARE_PARTIAL = 0.1;
const SHARE_SENT = 0.85;
const SHARE_DONE = 0.75;
const SHARE_PAUSED = 0.12;
const SHARE_BY_ADMIN = 0.3;

/** Small deterministic generator (LCG), so the demo looks the same on every restart. */
function random(seed: number) {
  let state = seed;
  const next = () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
    return state / 2_147_483_648;
  };
  const pick = <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)] as T;
  const chance = (p: number) => next() < p;
  const between = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  return { next, pick, chance, between };
}

export interface DemoEvent {
  action: EventAction;
  meta: EventMeta | null;
  at: string;
}

export interface DemoParticipant {
  ownerName: string;
  profile: BusinessProfile;
  joinedOn: string;
  byAdmin: boolean;
  answers: Answers | null;
  hardest: SectionId | null;
  startedAt: string | null;
  completedAt: string | null;
  packOn: string | null;
  sentAt: string | null;
  doneAt: string | null;
  events: DemoEvent[];
}

const at = (date: string, minutes: number) => {
  const hour = String(9 + Math.floor(minutes / 60)).padStart(2, "0");
  return `${date}T${hour}:${String(minutes % 60).padStart(2, "0")}:00+07:00`;
};

function answersFor(rng: ReturnType<typeof random>): Answers {
  // Each business struggles more in some sections than others.
  const strain = new Map(diagnosisBank.sections.map((s) => [s.id, rng.next()]));
  return Object.fromEntries(
    diagnosisBank.questions.map((q) => {
      const roll = rng.next();
      const level = strain.get(q.sectionId) ?? 0.5;
      const value: StoredAnswer =
        q.skipWhen && rng.chance(0.15)
          ? "lewati"
          : roll < level * 0.55
            ? q.redAnswer
            : roll < level * 0.55 + 0.25
              ? q.yellowAnswer
              : q.redAnswer === "belum"
                ? "ya"
                : "belum";
      return [q.id, value];
    }),
  );
}

export function demoCohort(today: string): DemoParticipant[] {
  return COHORT.map(([name, product, ownerName], index) => {
    const rng = random(index + 1);
    const joinedOn = addDays(
      today,
      -Math.round((COHORT_SPAN_DAYS * (COHORT.length - index)) / COHORT.length),
    );
    const base: DemoParticipant = {
      ownerName,
      profile: {
        name,
        product,
        location: rng.pick(LOCATIONS),
        sector: rng.pick(SECTORS),
        yearsRunning: rng.pick(YEARS_RUNNING),
        employees: rng.pick(EMPLOYEE_COUNTS),
        ownerRole: rng.pick(OWNER_ROLES),
      },
      joinedOn,
      byAdmin: rng.chance(SHARE_BY_ADMIN),
      answers: null,
      hardest: null,
      startedAt: null,
      completedAt: null,
      packOn: null,
      sentAt: null,
      doneAt: null,
      events: [{ action: "profil_selesai", meta: null, at: at(joinedOn, 0) }],
    };
    if (rng.chance(SHARE_NOT_STARTED)) return base;

    const answers = answersFor(rng);
    const startedOn = addDays(joinedOn, rng.between(0, 1));
    const startedAt = at(startedOn, 10);
    base.events.push({ action: "login", meta: null, at: at(startedOn, 5) });
    base.events.push({ action: "diagnosa_mulai", meta: null, at: startedAt });
    if (rng.chance(SHARE_PARTIAL)) {
      const firstTwo = diagnosisBank.questions.slice(0, 10).map((q) => [q.id, answers[q.id]]);
      return { ...base, answers: Object.fromEntries(firstTwo), startedAt };
    }

    const minutes = rng.chance(SHARE_PAUSED) ? rng.between(35, 140) : rng.between(5, 15);
    const completedAt = at(startedOn, 10 + minutes);
    const hardest = rng.pick(hardestCandidates(computeMap(answers)));
    const pack = buildPack(answers, hardest);
    const age = daysBetween(startedOn, today);
    const day30 = addDays(startedOn, rules.followUpDays);
    const late = daysBetween(day30, today);
    const sentOn =
      late >= 0 && rng.chance(SHARE_SENT)
        ? addDays(day30, rng.between(0, Math.min(late, 4)))
        : null;
    const doneOn =
      sentOn && daysBetween(sentOn, today) >= 2 && rng.chance(SHARE_DONE)
        ? addDays(sentOn, rng.between(1, Math.min(daysBetween(sentOn, today), 6)))
        : null;

    const events = base.events;
    events.push({ action: "diagnosa_selesai", meta: { repot: hardest }, at: completedAt });
    events.push({
      action: "paket_dibuat",
      meta: { sop: pack.sops.map((s) => s.sopId) },
      at: completedAt,
    });
    const openDays = new Set([
      0,
      ...Array.from({ length: rng.between(0, 6) }, () => rng.between(1, Math.max(1, age))),
    ]);
    for (const day of [...openDays].filter((d) => d <= age)) {
      events.push({
        action: "hasil_buka",
        meta: { hari: day + 1 },
        at: at(addDays(startedOn, day), 30),
      });
    }
    pack.sops.forEach((sop, position) => {
      if (rng.chance(0.85 - position * 0.15)) {
        events.push({
          action: "sop_buka",
          meta: { sop: sop.sopId },
          at: at(startedOn, 40 + position),
        });
      }
    });
    if (rng.chance(0.6)) events.push({ action: "kirim_wa", meta: null, at: at(startedOn, 50) });
    if (rng.chance(0.3)) events.push({ action: "cetak", meta: null, at: at(startedOn, 55) });

    return {
      ...base,
      answers,
      hardest,
      startedAt,
      completedAt,
      packOn: startedOn,
      sentAt: sentOn ? at(sentOn, 60) : null,
      doneAt: doneOn ? at(doneOn, 360) : null,
    };
  });
}
