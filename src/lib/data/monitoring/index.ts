import { LOCATIONS } from "@/lib/validations/business";

import { buildFunnel } from "../research";
import type { Participant, ResearchEvent, TeamMember } from "../types";
import { buildAlerts } from "./alerts";
import {
  buildDuration,
  buildHardest,
  buildProfile,
  buildSectionHealth,
  buildSopUsage,
  buildTopProblems,
} from "./insights";
import { buildSampleProgress, buildTimeline, readyPacks } from "./progress";
import { buildEngagement, buildTeam } from "./usage";
import { ALL, type Monitoring, type MonitoringFilters } from "./types";

export * from "./types";
export { ALERT_PREVIEW, ALERT_RULES, PACE_WINDOW_WEEKS, SAMPLE_THRESHOLDS } from "./targets";

export const FILTER_PARAMS = { location: "lokasi", staff: "pendamping" } as const;

/** Reads `?lokasi=` and `?pendamping=`; anything unknown falls back to "semua". */
export function parseMonitoringFilters(
  params: Record<string, string | string[] | undefined>,
  members: TeamMember[],
): MonitoringFilters {
  const location = LOCATIONS.find((l) => l === params[FILTER_PARAMS.location]) ?? ALL;
  const staff = params[FILTER_PARAMS.staff];
  const staffId = members.some((m) => m.id === staff) && typeof staff === "string" ? staff : ALL;
  return { location, staffId };
}

function applyFilters(participants: Participant[], filters: MonitoringFilters) {
  return participants.filter(
    ({ business }) =>
      (filters.location === ALL || business.location === filters.location) &&
      (filters.staffId === ALL || business.createdBy === filters.staffId),
  );
}

/** Every number on /peneliti/pantauan, computed from the same filtered slice. */
export function buildMonitoring(input: {
  participants: Participant[];
  events: ResearchEvent[];
  members: TeamMember[];
  filters: MonitoringFilters;
  today: string;
  now: Date;
  deadline: string;
}): Monitoring {
  const { today, deadline } = input;
  const participants = applyFilters(input.participants, input.filters);
  const ids = new Set(participants.map((p) => p.business.id));
  const events = input.events.filter((e) => ids.has(e.businessId));
  const packs = readyPacks(participants);

  return {
    participants: participants.length,
    totalParticipants: input.participants.length,
    sample: buildSampleProgress(participants, today, deadline),
    timeline: buildTimeline(participants, today, deadline),
    funnel: buildFunnel(participants, today),
    alerts: buildAlerts(participants, events, today, input.now),
    readyPacks: packs.length,
    sectionHealth: buildSectionHealth(packs),
    hardest: buildHardest(packs),
    problems: buildTopProblems(packs),
    sops: buildSopUsage(packs, events),
    engagement: buildEngagement(packs, events),
    duration: buildDuration(participants),
    profile: buildProfile(participants),
    team: buildTeam(participants, input.members),
    sources: {
      template: packs.filter((p) => p.source === "template").length,
      llm: packs.filter((p) => p.source === "llm").length,
    },
  };
}
