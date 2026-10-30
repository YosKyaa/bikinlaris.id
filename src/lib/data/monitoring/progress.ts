import { rules } from "@/lib/diagnosis/bank";
import { addDays, daysBetween, todayIso } from "@/lib/format";

import type { Pack, Participant } from "../types";
import { DAYS_PER_WEEK, PACE_WINDOW_WEEKS, SAMPLE_THRESHOLDS } from "./targets";
import type { SampleProgress, Timeline, TimelinePoint } from "./types";

/** WIB calendar day of a timestamp. */
export const wibDay = (isoDateTime: string) => todayIso(new Date(isoDateTime));

export function readyPacks(participants: Participant[]): Pack[] {
  return participants.flatMap(({ pack }) => (pack?.status === "siap" ? [pack] : []));
}

/** Will the sample be large enough by the deadline, and how many packs are still needed? */
export function buildSampleProgress(
  participants: Participant[],
  today: string,
  deadline: string,
): SampleProgress {
  const packs = readyPacks(participants);
  const done = packs.filter((p) => p.questionnaireDoneAt).length;
  const reachable = packs.filter((p) => p.followUpOn <= deadline).length;
  const lastPackDay = addDays(deadline, -rules.followUpDays);
  const next = SAMPLE_THRESHOLDS.find((t) => t.n > reachable);
  const windowStart = addDays(today, -PACE_WINDOW_WEEKS * DAYS_PER_WEEK);
  const recent = packs.filter((p) => p.createdOn > windowStart).length;

  return {
    done,
    reachable,
    thresholds: SAMPLE_THRESHOLDS,
    deadline,
    lastPackDay,
    daysToLastPackDay: daysBetween(today, lastPackDay),
    nextThreshold: next ? { n: next.n, missing: next.n - reachable } : null,
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
 * One point per day, from the first participant to the later of the deadline and the last
 * day 30: packs made and questionnaires filled in (up to today), and packs at day 30
 * (known ahead, since day 30 follows from the pack date).
 */
export function buildTimeline(
  participants: Participant[],
  today: string,
  deadline: string,
): Timeline {
  const packs = readyPacks(participants);
  const firstDay = participants.map((p) => wibDay(p.business.createdAt)).sort()[0];
  if (!firstDay) return { points: [], today, deadline };

  const created = packs.map((p) => p.createdOn).sort();
  const day30 = packs.map((p) => p.followUpOn).sort();
  const done = packs.flatMap((p) => (p.questionnaireDoneAt ? [wibDay(p.questionnaireDoneAt)] : []));
  const lastDay = [today, deadline, ...day30].sort().at(-1) ?? today;

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
  return { points, today, deadline };
}
