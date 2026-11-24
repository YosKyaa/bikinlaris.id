"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import * as id from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { data } from "@/lib/data";
import { getStaffUser } from "@/lib/data/staff-session";
import { TEXT_EDITS_TAG } from "@/lib/data/text-edits";
import type { Result } from "@/lib/data/types";
import {
  EDIT_FIELDS,
  EDIT_KINDS,
  EDIT_MAX_LENGTH,
  EDIT_VARIANTS,
  isEditTarget,
  readText,
  targetId,
} from "@/lib/diagnosis/edits";

/** Longest bank key ("<sop id>:<task id>"); anything longer is not a bank id. */
const KEY_MAX_LENGTH = 80;

const targetSchema = z.object({
  kind: z.enum(EDIT_KINDS),
  key: z.string().max(KEY_MAX_LENGTH),
  field: z.enum(EDIT_FIELDS),
  variant: z.enum(EDIT_VARIANTS),
});

/**
 * Admin fixes one text of the check or the SOPs; `null` puts the bank.json text back. A text
 * typed back to the bank text counts as putting it back, so no empty edit is stored. Owners
 * see the change on their next page (the cached edits are expired here).
 */
export async function saveTextEditAction(
  target: unknown,
  value: string | null,
): Promise<Result<null>> {
  const copy = id.questionBank.errors;
  const admin = await getStaffUser();
  if (admin?.role !== "admin") return { ok: false, error: copy.forbidden };
  const parsed = targetSchema.safeParse(target);
  if (!parsed.success || !isEditTarget(parsed.data)) return { ok: false, error: copy.invalid };

  const text = value === null ? null : value.replace(/\s+/g, " ").trim();
  const max = EDIT_MAX_LENGTH[parsed.data.field];
  if (text !== null && text.length === 0) return { ok: false, error: copy.empty };
  if (text !== null && text.length > max) return { ok: false, error: copy.tooLong(max) };

  try {
    const edits = await data().texts.listEdits();
    const others = edits.filter((edit) => targetId(edit) !== targetId(parsed.data));
    const original = readText(parsed.data, others);
    await data().staff.saveTextEdit(parsed.data, text === original ? null : text);
    updateTag(TEXT_EDITS_TAG);
    revalidatePath(ROUTES.bank);
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: copy.failed };
  }
}
