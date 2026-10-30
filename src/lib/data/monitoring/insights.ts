import { diagnosisBank, type ProblemId, type SectionId } from "@/content/diagnosis";
import { SECTION_COLORS } from "@/content/diagnosis.types";
import { EMPLOYEE_COUNTS, LOCATIONS, SECTORS, YEARS_RUNNING } from "@/lib/validations/business";

import type { Pack, Participant, ResearchEvent } from "../types";
import { wibDay } from "./progress";
import { DURATION_LIMITS, TOP_PROBLEMS } from "./targets";
import {
  DURATION_BUCKETS,
  type CountRow,
  type DurationStats,
  type SampleProfile,
  type SectionHealthRow,
  type SopUsageRow,
} from "./types";

const MINUTE_MS = 60_000;

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[middle] ?? null)
    : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

/** Count per key in a fixed key order (keeps the bank / form order), zeros included. */
export function countBy<K extends string>(keys: readonly K[], values: K[]): CountRow<K>[] {
  return keys.map((key) => ({ key, value: values.filter((v) => v === key).length }));
}

/** Highest first; ties keep their original (bank) order. */
export const byValue = <K extends string>(rows: CountRow<K>[]) =>
  [...rows].sort((a, b) => b.value - a.value);

/** How many packs put each section in green, yellow or red. Reddest sections first. */
export function buildSectionHealth(packs: Pack[]): SectionHealthRow[] {
  const rows = diagnosisBank.sections.map((section) => {
    const counts = Object.fromEntries(
      SECTION_COLORS.map((color) => [
        color,
        packs.filter((p) => p.map[section.id].color === color).length,
      ]),
    ) as Record<(typeof SECTION_COLORS)[number], number>;
    return { sectionId: section.id, ...counts };
  });
  return rows.sort((a, b) => b.merah - a.merah || b.kuning - a.kuning);
}

export function buildHardest(packs: Pack[]): CountRow<SectionId>[] {
  const ids = diagnosisBank.sections.map((s) => s.id);
  return byValue(
    countBy(
      ids,
      packs.map((p) => p.hardestSection),
    ),
  );
}

export function buildTopProblems(packs: Pack[]): CountRow<ProblemId>[] {
  const ids = diagnosisBank.problems.map((p) => p.id);
  const found = packs.flatMap((p) => p.problems.map((problem) => problem.id));
  return byValue(countBy(ids, found))
    .filter((row) => row.value > 0)
    .slice(0, TOP_PROBLEMS);
}

/** Per SOP: in how many packs it landed, and how many of those owners opened it. */
export function buildSopUsage(packs: Pack[], events: ResearchEvent[]): SopUsageRow[] {
  const opened = new Set(
    events.flatMap((e) =>
      e.action === "sop_buka" && typeof e.meta?.sop === "string"
        ? [`${e.businessId}:${e.meta.sop}`]
        : [],
    ),
  );
  return diagnosisBank.sops
    .map((sop) => {
      const holders = packs.filter((p) => p.sops.some((s) => s.sopId === sop.id));
      return {
        sopId: sop.id,
        assigned: holders.length,
        opened: holders.filter((p) => opened.has(`${p.businessId}:${sop.id}`)).length,
      };
    })
    .sort((a, b) => b.assigned - a.assigned || b.opened - a.opened);
}

/** Minutes from the first answer to the end of the check; long ones were resumed later. */
export function buildDuration(participants: Participant[]): DurationStats {
  const minutes = participants.flatMap(({ diagnosis }) =>
    diagnosis?.completedAt
      ? [(Date.parse(diagnosis.completedAt) - Date.parse(diagnosis.startedAt)) / MINUTE_MS]
      : [],
  );
  const bucketOf = (m: number) => {
    const index = DURATION_LIMITS.findIndex((limit) => m < limit);
    return DURATION_BUCKETS[index === -1 ? DURATION_LIMITS.length : index] ?? "over30";
  };
  const middle = median(minutes);
  return {
    completed: minutes.length,
    medianMinutes: middle === null ? null : Math.round(middle),
    buckets: countBy(DURATION_BUCKETS, minutes.map(bucketOf)),
  };
}

export function buildProfile(participants: Participant[]): SampleProfile {
  const of = participants.map((p) => p.business);
  return {
    location: countBy(
      LOCATIONS,
      of.map((b) => b.location),
    ),
    sector: countBy(
      SECTORS,
      of.map((b) => b.sector),
    ),
    yearsRunning: countBy(
      YEARS_RUNNING,
      of.map((b) => b.yearsRunning),
    ),
    employees: countBy(
      EMPLOYEE_COUNTS,
      of.map((b) => b.employees),
    ),
  };
}

/** Distinct WIB days with an event of this action, per business. */
export function daysWith(events: ResearchEvent[], action: ResearchEvent["action"]) {
  const days = new Map<string, Set<string>>();
  for (const event of events) {
    if (event.action !== action) continue;
    const set = days.get(event.businessId) ?? new Set<string>();
    set.add(wibDay(event.createdAt));
    days.set(event.businessId, set);
  }
  return days;
}
