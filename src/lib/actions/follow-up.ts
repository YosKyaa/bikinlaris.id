"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { data } from "@/lib/data";
import { getStaffUser } from "@/lib/data/staff-session";
import type { Result } from "@/lib/data/types";
import { contactNoteSchema, type ContactNoteInput } from "@/lib/validations/contact";

/**
 * Following participants up: who looks after them (pendamping) and the contact log. Every
 * action re-checks the staff session; the database checks the same rules again
 * (tim_atur_pendamping, RLS on kontak_catatan).
 */

const forbidden = { ok: false, error: id.researcher.forbidden } as const;
/** tim_atur_pendamping takes at most 500 at once. */
const MAX_ASSIGN = 500;
const assignSchema = z.object({
  businessIds: z.array(z.uuid()).min(1).max(MAX_ASSIGN),
  // Supabase user ids are UUIDs; the demo data uses the same format.
  staffId: z.string().min(1).max(64).nullable(),
});

const DATABASE_REFUSALS: Record<string, string> = {
  bukan_anggota: id.assign.errors.notMember,
  khusus_admin: id.assign.hintOther,
};

function refusal(error: unknown): string {
  const text = error instanceof Error ? error.message : "";
  const key = Object.keys(DATABASE_REFUSALS).find((code) => text.includes(code));
  return key ? DATABASE_REFUSALS[key] : id.assign.errors.failed;
}

/** Gives participants to a team member, or clears it (`staffId: null`). Returns how many changed. */
export async function assignParticipantsAction(
  businessIds: string[],
  staffId: string | null,
): Promise<Result<{ changed: number }>> {
  const user = await getStaffUser();
  if (!user) return forbidden;
  const parsed = assignSchema.safeParse({ businessIds, staffId });
  if (!parsed.success) return { ok: false, error: id.assign.errors.failed };
  // Same rule as the database, so a pendamping gets a clear message before the round trip.
  if (user.role !== "admin" && parsed.data.staffId !== null && parsed.data.staffId !== user.id) {
    return { ok: false, error: id.assign.hintOther };
  }
  try {
    const changed = await data().staff.assignParticipants(
      parsed.data.businessIds,
      parsed.data.staffId,
    );
    if (changed === 0) return { ok: false, error: id.assign.errors.nothing };
    revalidatePath(ROUTES.researcher, "layout");
    return { ok: true, data: { changed } };
  } catch (error) {
    return { ok: false, error: refusal(error) };
  }
}

const businessIdSchema = z.uuid();

export async function addContactNoteAction(
  businessId: string,
  values: ContactNoteInput,
): Promise<Result<null>> {
  if (!(await getStaffUser())) return forbidden;
  const parsedId = businessIdSchema.safeParse(businessId);
  const parsed = contactNoteSchema.safeParse(values);
  if (!parsedId.success || !parsed.success) return { ok: false, error: id.contact.errors.failed };
  try {
    await data().staff.addContactNote(parsedId.data, parsed.data.outcome, parsed.data.note || null);
    revalidatePath(ROUTES.researcher, "layout");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: id.contact.errors.failed };
  }
}

/** The author or an admin (RLS "penulis atau admin menghapus catatan"). */
export async function deleteContactNoteAction(noteId: number): Promise<Result<null>> {
  if (!(await getStaffUser())) return forbidden;
  const parsed = z.number().int().positive().safeParse(noteId);
  if (!parsed.success) return { ok: false, error: id.contact.errors.deleteFailed };
  try {
    const deleted = await data().staff.deleteContactNote(parsed.data);
    if (!deleted) return { ok: false, error: id.contact.errors.deleteFailed };
    revalidatePath(ROUTES.researcher, "layout");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: id.contact.errors.deleteFailed };
  }
}

/** Admin only: empties the error log on the Sistem page. */
export async function clearErrorsAction(): Promise<Result<null>> {
  if ((await getStaffUser())?.role !== "admin") return forbidden;
  try {
    await data().staff.clearErrors();
    revalidatePath(ROUTES.system);
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: id.system.errors.clearFailed };
  }
}
