import { answeredCount } from "@/lib/diagnosis/scoring";
import { daysBetween } from "@/lib/format";

import type { Participant, ResearchEvent } from "../types";
import { wibDay } from "./progress";
import { ALERT_RULES } from "./targets";
import { ALERT_KINDS, type AlertGroup, type AlertItem, type AlertKind } from "./types";

const MINUTE_MS = 60_000;

/** Latest event per business (ISO timestamp). */
function lastActivity(events: ResearchEvent[]): Map<string, string> {
  const latest = new Map<string, string>();
  for (const event of events) {
    const seen = latest.get(event.businessId);
    if (!seen || event.createdAt > seen) latest.set(event.businessId, event.createdAt);
  }
  return latest;
}

/** Which rule a participant breaks today, if any, and for how many days. */
function classify(
  participant: Participant,
  activity: Map<string, string>,
  today: string,
  now: Date,
): { kind: AlertKind; days: number } | null {
  const { business, diagnosis, pack } = participant;
  if (pack?.status === "siap") {
    if (pack.questionnaireDoneAt) return null;
    if (pack.questionnaireSentAt) {
      const days = daysBetween(wibDay(pack.questionnaireSentAt), today);
      return days >= ALERT_RULES.awaitingAnswerDays ? { kind: "awaitingAnswer", days } : null;
    }
    const days = daysBetween(pack.followUpOn, today);
    return days >= ALERT_RULES.sendOverdueDays ? { kind: "sendOverdue", days } : null;
  }
  if (pack) {
    const minutes = (now.getTime() - Date.parse(pack.generationStartedAt)) / MINUTE_MS;
    const days = daysBetween(wibDay(pack.generationStartedAt), today);
    return minutes >= ALERT_RULES.packStuckMinutes ? { kind: "packStuck", days } : null;
  }
  if (answeredCount(diagnosis?.answers ?? {}) > 0) {
    const since = activity.get(business.id) ?? diagnosis?.startedAt ?? business.createdAt;
    const days = daysBetween(wibDay(since), today);
    return days >= ALERT_RULES.stalledDays ? { kind: "stalled", days } : null;
  }
  const days = daysBetween(wibDay(business.createdAt), today);
  return days >= ALERT_RULES.notStartedDays ? { kind: "notStarted", days } : null;
}

/** "Perlu tindakan": participants who need a nudge from the team, longest waiting first. */
export function buildAlerts(
  participants: Participant[],
  events: ResearchEvent[],
  today: string,
  now: Date,
): AlertGroup[] {
  const activity = lastActivity(events);
  const groups = new Map<AlertKind, AlertItem[]>(ALERT_KINDS.map((kind) => [kind, []]));
  for (const participant of participants) {
    const hit = classify(participant, activity, today, now);
    if (!hit) continue;
    groups.get(hit.kind)?.push({
      businessId: participant.business.id,
      code: participant.business.code,
      businessName: participant.business.name,
      days: hit.days,
    });
  }
  return ALERT_KINDS.map((kind) => ({
    kind,
    items: (groups.get(kind) ?? []).sort((a, b) => b.days - a.days || a.code.localeCompare(b.code)),
  }));
}
