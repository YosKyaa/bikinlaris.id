import { addDays, todayIso } from "@/lib/format";
import { percentOf } from "@/lib/viz";

import { DUE_WINDOW_DAYS } from "../research";
import type { Pack, Participant } from "../types";
import { DAYS_PER_WEEK, PACE_WINDOW_WEEKS } from "./targets";
import type { ProgramProgress, Timeline, TimelinePoint } from "./types";

/** WIB calendar day of a timestamp. */
export const wibDay = (isoDateTime: string) => todayIso(new Date(isoDateTime));

export function readyPacks(participants: Participant[]): Pack[] {
  return participants.flatMap(({ pack }) => (pack?.status === "siap" ? [pack] : []));
}

/**
 * Where the program stands, with no end date (owner request, 3 November 2026): who runs a
 * SOP now, who reaches day 30 soon, and how many day-30 questionnaires came back.
 */
export function buildProgramProgress(participants: Participant[], today: string): ProgramProgress {
  const packs = readyPacks(participants);
  const pastDay30 = packs.filter((p) => p.followUpOn <= today).length;
  const done = packs.filter((p) => p.questionnaireDoneAt).length;
  const soon = addDays(today, DUE_WINDOW_DAYS);
  const windowStart = addDays(today, -PACE_WINDOW_WEEKS * DAYS_PER_WEEK);
  const recent = packs.filter((p) => p.createdOn > windowStart).length;

  return {
    done,
    pastDay30,
    responsePercent: percentOf(done, pastDay30),
    active: packs.length - pastDay30,
    upcoming: packs.filter((p) => p.followUpOn > today && p.followUpOn <= soon).length,
    weeklyPace: Math.round((recent / PACE_WINDOW_WEEKS) * 10) / 10,
  };
}

/** Cumulative count of `days` (sorted ISO days) on or before `day`. */
function cumulative(days: string[]) {
  let index = 0;
  return (day: string) => {
    while (index < days.length && (days[index] ?? "") <= day) index += 1;
    return index;
  };
}

/**
 * One point per day, from the first participant to the later of today and the last day 30:
 * packs made and questionnaires filled in (up to today), and packs at day 30 (known ahead,
 * since day 30 follows from the pack date).
 */
export function buildTimeline(participants: Participant[], today: string): Timeline {
  const packs = readyPacks(participants);
  const firstDay = participants.map((p) => wibDay(p.business.createdAt)).sort()[0];
  if (!firstDay) return { points: [], today };

  const created = packs.map((p) => p.createdOn).sort();
  const day30 = packs.map((p) => p.followUpOn).sort();
  const done = packs.flatMap((p) => (p.questionnaireDoneAt ? [wibDay(p.questionnaireDoneAt)] : []));
  const lastDay = [today, ...day30].sort().at(-1) ?? today;

  const countCreated = cumulative(created);
  const countDay30 = cumulative(day30);
  const countDone = cumulative(done.sort());
  const points: TimelinePoint[] = [];
  for (let day = firstDay; day <= lastDay; day = addDays(day, 1)) {
    const past = day <= today;
    const point: TimelinePoint = {
      date: day,
      packs: countCreated(day),
      day30: countDay30(day),
      done: countDone(day),
    };
    points.push(past ? point : { ...point, packs: null, done: null });
  }
  return { points, today };
}
