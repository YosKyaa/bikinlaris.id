/** "Tanya coach" limits. One place to tune cost and length. */

/** Questions per owner per day (WIB). Keeps cost predictable; there are no reminders. */
export const COACH_DAILY_LIMIT = 10;
export const QUESTION_MAX_LENGTH = 300;
/** Stored answers are cut here (database CHECK allows 4000). */
export const ANSWER_MAX_LENGTH = 2000;
/** Includes reasoning tokens on reasoning models; answers themselves are ~120 words. */
export const ANSWER_MAX_TOKENS = 1500;
export const ANSWER_TIMEOUT_MS = 25_000;
/** Earlier messages sent along with a new question, so follow-ups make sense. */
export const CONTEXT_MESSAGES = 6;

/** Suggested questions. The key is stored with the question for analysis; free text = null. */
export const COACH_TOPICS = ["mulai", "karyawan", "waktu", "ramai"] as const;
export type CoachTopic = (typeof COACH_TOPICS)[number];
