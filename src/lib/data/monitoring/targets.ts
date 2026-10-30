import type { SampleThreshold } from "./types";

/**
 * Minimum SEM-PLS sample, inverse square root method (Kock & Hadaya, 2018), from
 * docs/konteks-riset.md: about 99 respondents for p_min 0.25 and 155 for p_min 0.20.
 */
export const SAMPLE_THRESHOLDS: readonly SampleThreshold[] = [
  { n: 99, pMin: 0.25 },
  { n: 155, pMin: 0.2 },
];

/** Weekly pace of new packs is averaged over this many recent weeks. */
export const PACE_WINDOW_WEEKS = 4;
export const DAYS_PER_WEEK = 7;

/** When a participant shows up under "Perlu tindakan". */
export const ALERT_RULES = {
  /** Added, but no answer yet after this many days. */
  notStartedDays: 2,
  /** Started the check, no activity since this many days, no pack. */
  stalledDays: 1,
  /** Pack still "menyusun" this many minutes after it started (owner closed the page). */
  packStuckMinutes: 10,
  /** Day 30 passed this many days ago and the questionnaire is not sent. */
  sendOverdueDays: 1,
  /** Questionnaire sent this many days ago and not marked as filled in. */
  awaitingAnswerDays: 5,
} as const;

/** Rows shown per alert group before "dan N lainnya". */
export const ALERT_PREVIEW = 5;
export const TOP_PROBLEMS = 5;

/** Upper bounds (minutes) of the check duration buckets; the last bucket is open. */
export const DURATION_LIMITS = [5, 10, 15, 30] as const;
