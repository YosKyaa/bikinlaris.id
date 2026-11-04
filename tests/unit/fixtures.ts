import { diagnosisBank } from "@/content/diagnosis";
import type { Answers, ContactNote, Participant } from "@/lib/data/types";
import { buildPack } from "@/lib/diagnosis/scoring";
import { addDays } from "@/lib/format";

/** A fixed "today" so stage and day numbers do not depend on when the tests run. */
export const TODAY = "2026-11-04";
export const MEMBER_A = "00000000-0000-4000-8000-000000000901";
export const MEMBER_B = "00000000-0000-4000-8000-000000000902";

const ANSWER_CYCLE = ["belum", "kadang", "ya"] as const;
const ANSWERS = Object.fromEntries(
  diagnosisBank.questions.map((q, index) => [q.id, ANSWER_CYCLE[index % ANSWER_CYCLE.length]]),
) as Answers;
const FOLLOW_UP_DAYS = 30;

let next = 1;

/** One participant; `packDaysAgo` gives a ready pack created that many days before TODAY. */
export function participant(options: {
  assignedTo?: string | null;
  packDaysAgo?: number;
  sent?: boolean;
}): Participant {
  const n = next++;
  const businessId = `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
  const createdOn = options.packDaysAgo === undefined ? null : addDays(TODAY, -options.packDaysAgo);
  return {
    token: `token-${n}`,
    business: {
      id: businessId,
      code: `BL-${String(n).padStart(3, "0")}`,
      name: `Usaha ${n}`,
      ownerName: `Pemilik ${n}`,
      whatsapp: `62812000${String(n).padStart(5, "0")}`,
      product: "nasi box",
      location: "32.76",
      sector: "kuliner",
      yearsRunning: "3_5",
      employees: "1_4",
      ownerRole: "pemilik",
      createdAt: `${addDays(TODAY, -40)}T02:00:00.000Z`,
      createdBy: options.assignedTo ?? null,
      assignedTo: options.assignedTo ?? null,
      signupVia: "pendamping",
    },
    diagnosis: createdOn
      ? {
          id: `d-${n}`,
          businessId,
          answers: ANSWERS,
          hardestSection: "uang",
          startedAt: `${createdOn}T02:00:00.000Z`,
          completedAt: `${createdOn}T02:10:00.000Z`,
        }
      : null,
    pack: createdOn
      ? {
          id: `p-${n}`,
          businessId,
          diagnosisId: `d-${n}`,
          hardestSection: "uang",
          ...buildPack(ANSWERS, "uang"),
          createdOn,
          followUpOn: addDays(createdOn, FOLLOW_UP_DAYS),
          source: "template",
          status: "siap",
          generationStartedAt: `${createdOn}T02:10:00.000Z`,
          questionnaireSentAt: options.sent ? `${TODAY}T03:00:00.000Z` : null,
          questionnaireDoneAt: null,
        }
      : null,
  };
}

export function note(
  businessId: string,
  outcome: ContactNote["outcome"],
  createdAt: string,
  staffId = MEMBER_A,
): ContactNote {
  return { id: next++, businessId, staffId, outcome, note: null, createdAt };
}
