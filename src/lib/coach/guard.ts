/**
 * Cheap checks on a coach question before any AI call (no tokens spent): tidy the text, and
 * turn away what is plainly not about running the business or tries to change the coach's
 * rules. Kept narrow on purpose ("tunjukkan aturan SOP 1" must pass); the model has its own
 * scope rule on top (prompt.ts).
 */

/** Invisible characters (control, zero-width, bidi): a common way to smuggle instructions. */
function isInvisible(code: number): boolean {
  const TAB = 0x09;
  const LINE_FEED = 0x0a;
  const CARRIAGE_RETURN = 0x0d;
  return (
    (code < 0x20 && code !== TAB && code !== LINE_FEED && code !== CARRIAGE_RETURN) ||
    code === 0x7f ||
    (code >= 0x200b && code <= 0x200f) ||
    (code >= 0x2028 && code <= 0x202f) ||
    (code >= 0x2060 && code <= 0x206f) ||
    code === 0xfeff
  );
}

/** A sum or formula only, e.g. "1+1=", "25 x 4", "(3+5)/2". */
const ARITHMETIC = /^[\d\s+\-*/×x÷:=().,^%?]+$/i;
/** Links, code and markup have no place in a question about the SOP pack. */
const LINKS_OR_CODE =
  /https?:\/\/|www\.|```|<\/?[a-z][\w-]*[\s>/]|\b(?:select|insert|drop)\s+\w+\s+(?:from|into|table)\b/i;
/** Attempts to change the coach's role or to read its instructions (Indonesian and English). */
const RULE_BREAKING = [
  /\b(?:abaikan|lupakan|ignore|disregard|forget)\b.{0,30}\b(?:semua|sebelumnya|di atas|tadi|previous|above|all|your)\b.{0,20}\b(?:instruksi|perintah|prompt|instructions?|rules?)\b/i,
  /\b(?:abaikan|lupakan|ignore|disregard|forget)\b.{0,15}\b(?:instruksi|perintah|prompt|instructions?|rules?)\b.{0,15}\b(?:sebelumnya|di atas|tadi|kamu|anda|sistem|previous|above)\b/i,
  /\b(?:system|developer)\s*(?:prompt|message|mode)\b|\bprompt\s+sistem\b|\bjailbreak\b/i,
  /\b(?:kamu|anda)\s+(?:sekarang|mulai sekarang)\s+(?:adalah|menjadi)\b|\byou are now\b|\bact as\b|\bpretend to be\b/i,
  /\b(?:tampilkan|tunjukkan|bocorkan|ulangi|reveal|show|print|repeat)\b.{0,30}\b(?:prompt|instruksi\s+(?:sistem|kamu|anda)|system message|your instructions)\b/i,
];

export type GuardResult = { ok: true; question: string } | { ok: false };

/** Normalised question, or a refusal when it is plainly off-topic or rule-breaking. */
export function guardQuestion(raw: string): GuardResult {
  const visible = [...raw].filter((char) => !isInvisible(char.codePointAt(0) ?? 0)).join("");
  const question = visible.replace(/\s+/g, " ").trim();
  const offTopic =
    (ARITHMETIC.test(question) && /\d/.test(question)) ||
    LINKS_OR_CODE.test(question) ||
    RULE_BREAKING.some((pattern) => pattern.test(question));
  return offTopic ? { ok: false } : { ok: true, question };
}

/** What the model answers, alone, for anything outside the coach's scope (prompt.ts). */
export const OFF_TOPIC_MARKER = "DI_LUAR_TOPIK";

/** True when the model used the marker (alone or with stray words around it). */
export const isOffTopicAnswer = (answer: string) => answer.includes(OFF_TOPIC_MARKER);
