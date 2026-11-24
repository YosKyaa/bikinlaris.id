"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";

import type { SectionId } from "@/content/diagnosis";
import * as id from "@/content/id";
import { data } from "@/lib/data";
import { clearOwnerCookie, getOwnerState, getOwnerToken, joinHref } from "@/lib/data/owner-session";
import type { Answers, EventAction, EventMeta, Result } from "@/lib/data/types";
import { rules } from "@/lib/diagnosis/bank";
import { personalizePack } from "@/lib/diagnosis/personalize";
import {
  buildPack,
  computeMap,
  countColors,
  firstIncompleteSection,
  isSectionComplete,
} from "@/lib/diagnosis/scoring";
import { dayNumber } from "@/lib/format";
import { errorMessage, reportError } from "@/lib/monitoring/report";
import { answersPayloadSchema, sectionIdSchema, sopIdSchema } from "@/lib/validations/diagnosis";

/**
 * Owner actions. The owner is identified by the private link token in an httpOnly cookie
 * (set by /u/[token]); the data source checks the token on every call.
 */

const noLink = { ok: false, error: id.owner.errors.noLink } as const;
const done: Result<null> = { ok: true, data: null };

/**
 * Passive research events are written after the answer has gone back to the phone (`after`),
 * so the owner never waits for them: Next.js runs one action at a time per page, and a slow
 * log would hold up the next answer. A failed log goes to the error log, never to the owner.
 */
function logLater(token: string, action: EventAction, meta: EventMeta | null) {
  after(async () => {
    try {
      await data().owner.log(token, action, meta);
    } catch (error) {
      await reportError({
        source: "server",
        message: errorMessage(error),
        digest: null,
        path: null,
        context: `log ${action}`,
      });
    }
  });
}

/** Stores answers in one round trip; the first answers of a diagnosis log `diagnosa_mulai`. */
async function storeAnswers(token: string, answers: Answers): Promise<Answers> {
  const saved = await data().owner.saveAnswers(token, answers);
  if (saved.first) logLater(token, "diagnosa_mulai", null);
  return saved.answers;
}

/**
 * Autosave. The stepper collects the answers tapped in quick succession and sends them
 * together, so five taps cost one request instead of five queued ones.
 */
export async function saveAnswersAction(answers: Record<string, string>): Promise<Result<null>> {
  const token = await getOwnerToken();
  if (!token) return noLink;
  const parsed = answersPayloadSchema.safeParse(answers);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return { ok: false, error: id.diagnosis.errors.saveFailed };
  }
  try {
    await storeAnswers(token, parsed.data);
    return done;
  } catch {
    return { ok: false, error: id.diagnosis.errors.saveFailed };
  }
}

/**
 * "Lanjut": stores this section's answers once more (so an autosave lost on a weak signal is
 * not lost for good) and checks the section is complete against what the database now holds,
 * in a single round trip.
 */
export async function completeSectionAction(
  sectionId: string,
  answers: Record<string, string>,
): Promise<Result<null>> {
  const token = await getOwnerToken();
  if (!token) return noLink;
  const section = sectionIdSchema.safeParse(sectionId);
  const payload = answersPayloadSchema.safeParse(answers);
  const advanceFailed = { ok: false, error: id.diagnosis.errors.advanceFailed } as const;
  if (!section.success || !payload.success) return advanceFailed;
  try {
    const stored = await storeAnswers(token, payload.data);
    if (!isSectionComplete(section.data as SectionId, stored)) return advanceFailed;
    logLater(token, "diagnosa_bagian", { bagian: section.data });
    return done;
  } catch {
    return advanceFailed;
  }
}

/** Closes the diagnosis and creates the pack structure (rule-based, from bank.json). */
export async function finishDiagnosisAction(hardest: string): Promise<Result<null>> {
  const state = await getOwnerState();
  if (!state) return noLink;
  if (state.pack) return done;
  const parsed = sectionIdSchema.safeParse(hardest);
  if (!parsed.success) return { ok: false, error: id.summary.hardestRequired };
  const answers = state.diagnosis?.answers ?? {};
  if (!state.diagnosis || firstIncompleteSection(answers) !== null) {
    return { ok: false, error: id.summary.incomplete };
  }

  const section = parsed.data as SectionId;
  try {
    const owner = data().owner;
    await owner.startPack(state.token, {
      hardest: section,
      ...buildPack(answers, section),
      followUpDays: rules.followUpDays,
    });
    logLater(state.token, "diagnosa_selesai", {
      repot: section,
      ...countColors(computeMap(answers)),
    });
    return done;
  } catch {
    return { ok: false, error: id.summary.errors.failed };
  }
}

/**
 * Writes the SOP texts (Claude, at most 15 s, else the template) and marks the pack ready.
 * Called once by the "menyusun paket" screen; safe to call again.
 */
export async function generatePackAction(): Promise<Result<null>> {
  const state = await getOwnerState();
  if (!state) return noLink;
  const { business, diagnosis, pack, token } = state;
  if (!pack || !diagnosis) return { ok: false, error: id.generating.failedBody };
  if (pack.status === "siap") return done;
  try {
    const result = await personalizePack(business, diagnosis, pack);
    const owner = data().owner;
    const ready = await owner.finishPack(token, result);
    logLater(token, "paket_dibuat", {
      sop: ready.sops.map((sop) => sop.sopId),
      masalah: ready.problems.length,
      sumber: ready.source,
    });
    return done;
  } catch {
    return { ok: false, error: id.generating.failedBody };
  }
}

/**
 * "Ulang cek usaha". Closed once the day-30 questionnaire has been sent: from then on the
 * answers and the pack are research data. The old answers go into the event log before they
 * are removed, so a redo never erases what the owner first said.
 */
export async function redoDiagnosisAction(): Promise<Result<null>> {
  const state = await getOwnerState();
  if (!state) return noLink;
  if (state.pack?.questionnaireSentAt) return { ok: false, error: id.pack.redo.locked };
  try {
    await data().owner.reset(state.token);
    logLater(state.token, "diagnosa_ulang", {
      jawaban_lama: state.diagnosis ? JSON.stringify(state.diagnosis.answers) : null,
      repot_lama: state.pack?.hardestSection ?? null,
      paket_lama: state.pack?.createdOn ?? null,
    });
    return done;
  } catch {
    return { ok: false, error: id.pack.redo.failed };
  }
}

/* ---------- passive research events from the pack page; failures never block the owner ---------- */

async function logForPack(action: EventAction, meta: (createdOn: string) => EventMeta | null) {
  const state = await getOwnerState();
  if (!state?.pack) return noLink;
  logLater(state.token, action, meta(state.pack.createdOn));
  return done;
}

export async function trackPackOpenedAction(): Promise<Result<null>> {
  return logForPack("hasil_buka", (createdOn) => ({ hari: dayNumber(createdOn) }));
}

export async function trackSopOpenedAction(sopId: string): Promise<Result<null>> {
  const parsed = sopIdSchema.safeParse(sopId);
  if (!parsed.success) return { ok: false, error: id.common.trackFailed };
  return logForPack("sop_buka", () => ({ sop: parsed.data }));
}

const shareSchema = z.enum(["kirim_wa", "cetak"]);

export async function trackShareAction(action: string): Promise<Result<null>> {
  const parsed = shareSchema.safeParse(action);
  if (!parsed.success) return { ok: false, error: id.common.trackFailed };
  return logForPack(parsed.data, () => null);
}

/** "Keluar dari HP ini": forgets the private link on this device (e.g. a shared phone). */
export async function ownerLogoutAction(): Promise<void> {
  await clearOwnerCookie();
  redirect(joinHref("keluar"));
}
