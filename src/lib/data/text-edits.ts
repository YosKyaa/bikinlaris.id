import "server-only";

import { unstable_cache } from "next/cache";

import type { Wording } from "@/lib/diagnosis/bank";
import { editsToLayers, type TextEdit } from "@/lib/diagnosis/edits";
import { textVariantFor } from "@/lib/diagnosis/variant";
import { errorMessage, reportError } from "@/lib/monitoring/report";
import type { Sector } from "@/lib/validations/business";

import { data } from "./index";

/** Cache tag of the admin text edits; the edit action expires it (updateTag). */
export const TEXT_EDITS_TAG = "bank-teks";
/** Safety net: even without an expiry, edits reach every server within five minutes. */
const TEXT_EDITS_REVALIDATE_SECONDS = 300;

/**
 * Admin text edits, cached across requests and servers: owner pages read them on every visit,
 * so they cost a database call only after an edit or every few minutes. A failed read (the
 * table not created yet, or a database hiccup) is not cached and shows the bank.json texts.
 */
const cachedEdits = unstable_cache(() => data().texts.listEdits(), [TEXT_EDITS_TAG], {
  tags: [TEXT_EDITS_TAG],
  revalidate: TEXT_EDITS_REVALIDATE_SECONDS,
});

/** One error-log line per server instance per window, not one per page view. */
const REPORT_EVERY_MS = 10 * 60 * 1000;
let lastReportedAt = 0;

export async function getTextEdits(): Promise<TextEdit[]> {
  try {
    return await cachedEdits();
  } catch (error) {
    if (Date.now() - lastReportedAt < REPORT_EVERY_MS) return [];
    lastReportedAt = Date.now();
    await reportError({
      source: "server",
      message: errorMessage(error),
      digest: null,
      path: null,
      context: "bank_teks",
    });
    return [];
  }
}

/** Texts a business sees: its wording (general or service) with the admin's edits. */
export async function wordingFor(sector: Sector): Promise<Wording> {
  return { variant: textVariantFor(sector), edits: editsToLayers(await getTextEdits()) };
}
