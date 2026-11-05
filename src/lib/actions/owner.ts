"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";

import type { QuestionId, SectionId } from "@/content/diagnosis";
import * as id from "@/content/id";
import { data } from "@/lib/data";
import { clearOwnerCookie, getOwnerState, getOwnerToken, joinHref } from "@/lib/data/owner-session";
import type { EventAction, EventMeta, Result } from "@/lib/data/types";
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
import { saveAnswerSchema, sectionIdSchema, sopIdSchema } from "@/lib/validations/diagnosis";

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

export async function saveAnswerAction(questionId: string, answer: string): Promise<Result<null>> {
  const token = await getOwnerToken();
  if (!token) return noLink;
  const parsed = saveAnswerSchema.safeParse({ questionId, answer });
  if (!parsed.success) return { ok: false, error: id.diagnosis.errors.saveFailed };
  try {
    const owner = data().owner;
    const { first } = await owner.saveAnswer(
      token,
      parsed.data.questionId as QuestionId,
      parsed.data.answer,
    );
    if (first) logLater(token, "diagnosa_mulai", null);
    return done;
  } catch {
    return { ok: false, error: id.diagnosis.errors.saveFailed };
  }
}

export async function completeSectionAction(sectionId: string): Promise<Result<null>> {
  const state = await getOwnerState();
  if (!state) return noLink;
  const parsed = sectionIdSchema.safeParse(sectionId);
  const answers = state.diagnosis?.answers ?? {};
  if (!parsed.success || !isSectionComplete(parsed.data as SectionId, answers)) {
    return { ok: false, error: id.diagnosis.errors.advanceFailed };
  }
  logLater(state.token, "diagnosa_bagian", { bagian: parsed.data });
  return done;
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

export async function redoDiagnosisAction(): Promise<Result<null>> {
  const token = await getOwnerToken();
  if (!token) return noLink;
  try {
    await data().owner.reset(token);
    logLater(token, "diagnosa_ulang", null);
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
