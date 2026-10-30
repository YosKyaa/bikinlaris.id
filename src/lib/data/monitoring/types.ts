import type { ProblemId, SectionId, SopId } from "@/content/diagnosis";
import type { EmployeeCount, Location, Sector, YearsRunning } from "@/lib/validations/business";

import type { FunnelStep } from "../types";

/** Shapes of the monitoring page (/peneliti/pantauan). Keys only; labels come from content/. */

export const ALL = "semua";

export interface MonitoringFilters {
  location: Location | typeof ALL;
  staffId: string | typeof ALL;
}

export interface CountRow<K extends string = string> {
  key: K;
  value: number;
}

export interface SampleThreshold {
  n: number;
  pMin: number;
}

export interface SampleProgress {
  /** Questionnaires marked as filled in. */
  done: number;
  /** Ready packs whose day 30 falls on or before the deadline: the best case for the sample. */
  reachable: number;
  thresholds: readonly SampleThreshold[];
  deadline: string;
  /** Packs created after this day reach day 30 after the deadline. */
  lastPackDay: string;
  daysToLastPackDay: number;
  /** Packs still needed (made by lastPackDay) to reach the next threshold; null when reached. */
  nextThreshold: { n: number; missing: number } | null;
  /** Packs created per week, averaged over the last weeks. */
  weeklyPace: number;
}

export interface TimelinePoint {
  date: string;
  packs: number | null;
  day30: number;
  done: number | null;
}

export interface Timeline {
  points: TimelinePoint[];
  today: string;
  deadline: string;
}

export const ALERT_KINDS = [
  "sendOverdue",
  "awaitingAnswer",
  "stalled",
  "notStarted",
  "packStuck",
] as const;
export type AlertKind = (typeof ALERT_KINDS)[number];

export interface AlertItem {
  businessId: string;
  code: string;
  businessName: string;
  /** Days since the situation started (0 = today). */
  days: number;
}

export interface AlertGroup {
  kind: AlertKind;
  items: AlertItem[];
}

export interface SectionHealthRow {
  sectionId: SectionId;
  hijau: number;
  kuning: number;
  merah: number;
}

export interface SopUsageRow {
  sopId: SopId;
  assigned: number;
  opened: number;
}

export const ACTIVE_DAY_BUCKETS = ["one", "two", "threeToFive", "sixPlus"] as const;
export type ActiveDayBucket = (typeof ACTIVE_DAY_BUCKETS)[number];

export interface Engagement {
  packs: number;
  reopened: number;
  sharedWa: number;
  printed: number;
  medianSopsOpened: number | null;
  activeDays: CountRow<ActiveDayBucket>[];
  /** Owners with a pack who asked the AI coach at least once, and all questions asked. */
  askedCoach: number;
  coachQuestions: number;
}

export const DURATION_BUCKETS = ["under5", "5to10", "10to15", "15to30", "over30"] as const;
export type DurationBucket = (typeof DURATION_BUCKETS)[number];

export interface DurationStats {
  completed: number;
  medianMinutes: number | null;
  buckets: CountRow<DurationBucket>[];
}

export interface TeamRow {
  staffId: string | null;
  name: string | null;
  added: number;
  packs: number;
  done: number;
}

export interface SampleProfile {
  location: CountRow<Location>[];
  sector: CountRow<Sector>[];
  yearsRunning: CountRow<YearsRunning>[];
  employees: CountRow<EmployeeCount>[];
}

export interface Monitoring {
  /** Participants after the filters, and before them. */
  participants: number;
  totalParticipants: number;
  sample: SampleProgress;
  timeline: Timeline;
  funnel: FunnelStep[];
  alerts: AlertGroup[];
  readyPacks: number;
  sectionHealth: SectionHealthRow[];
  hardest: CountRow<SectionId>[];
  problems: CountRow<ProblemId>[];
  sops: SopUsageRow[];
  engagement: Engagement;
  duration: DurationStats;
  profile: SampleProfile;
  team: TeamRow[];
  sources: { template: number; llm: number };
}
