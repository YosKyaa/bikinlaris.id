import type { Pack, Participant, ResearchEvent, TeamMember } from "../types";
import { daysWith, median } from "./insights";
import { ACTIVE_DAY_BUCKETS, type ActiveDayBucket, type Engagement, type TeamRow } from "./types";

const FEW_DAYS = 2;
const SEVERAL_DAYS = 5;

function activeDayBucket(days: number): ActiveDayBucket {
  if (days <= 1) return "one";
  if (days <= FEW_DAYS) return "two";
  if (days <= SEVERAL_DAYS) return "threeToFive";
  return "sixPlus";
}

/**
 * Passive usage of the pack (construct X triangulation, docs/konteks-riset.md): opened again
 * after day 1, sent to WhatsApp, printed, how many SOPs opened, on how many days.
 */
export function buildEngagement(packs: Pack[], events: ResearchEvent[]): Engagement {
  const openDays = daysWith(events, "hasil_buka");
  const did = (action: ResearchEvent["action"]) =>
    new Set(events.filter((e) => e.action === action).map((e) => e.businessId));
  const sharedWa = did("kirim_wa");
  const printed = did("cetak");
  const askedCoach = did("coach_tanya");
  const sopsOpened = new Map<string, Set<string>>();
  for (const event of events) {
    if (event.action !== "sop_buka" || typeof event.meta?.sop !== "string") continue;
    const set = sopsOpened.get(event.businessId) ?? new Set<string>();
    set.add(event.meta.sop);
    sopsOpened.set(event.businessId, set);
  }

  const buckets = new Map<ActiveDayBucket, number>(ACTIVE_DAY_BUCKETS.map((b) => [b, 0]));
  let reopened = 0;
  for (const pack of packs) {
    const days = openDays.get(pack.businessId) ?? new Set<string>();
    if ([...days].some((day) => day > pack.createdOn)) reopened += 1;
    const bucket = activeDayBucket(days.size);
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
  }

  return {
    packs: packs.length,
    reopened,
    sharedWa: packs.filter((p) => sharedWa.has(p.businessId)).length,
    printed: packs.filter((p) => printed.has(p.businessId)).length,
    medianSopsOpened: median(packs.map((p) => sopsOpened.get(p.businessId)?.size ?? 0)),
    activeDays: ACTIVE_DAY_BUCKETS.map((key) => ({ key, value: buckets.get(key) ?? 0 })),
    askedCoach: packs.filter((p) => askedCoach.has(p.businessId)).length,
    coachQuestions: events.filter((e) => e.action === "coach_tanya").length,
  };
}

/** Participants per team member who added them: added, packs made, questionnaires done. */
export function buildTeam(participants: Participant[], members: TeamMember[]): TeamRow[] {
  const rows = new Map<string | null, TeamRow>();
  for (const { business, pack } of participants) {
    const staffId = members.some((m) => m.id === business.createdBy) ? business.createdBy : null;
    const member = members.find((m) => m.id === staffId);
    const row = rows.get(staffId) ?? {
      staffId,
      name: member ? (member.name ?? member.email) : null,
      added: 0,
      packs: 0,
      done: 0,
    };
    row.added += 1;
    if (pack?.status === "siap") row.packs += 1;
    if (pack?.questionnaireDoneAt) row.done += 1;
    rows.set(staffId, row);
  }
  return [...rows.values()].sort((a, b) => b.added - a.added);
}
