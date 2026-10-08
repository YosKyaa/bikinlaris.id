"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { data } from "@/lib/data";
import { getStaffUser } from "@/lib/data/staff-session";
import type { NewParticipant, Result, TeamInvite } from "@/lib/data/types";
import { inviteSchema } from "@/lib/validations/auth";
import {
  normalizeWhatsApp,
  participantSchema,
  type ParticipantInput,
} from "@/lib/validations/participant";

/** Research team actions. Every action re-checks the staff session; RLS checks it again. */

const forbidden = { ok: false, error: id.researcher.forbidden } as const;
const businessIdSchema = z.uuid();

function toParticipant(values: ParticipantInput): NewParticipant {
  return { ...values, whatsapp: normalizeWhatsApp(values.whatsapp) };
}

export async function createParticipantAction(
  values: ParticipantInput,
): Promise<Result<{ businessId: string }>> {
  if (!(await getStaffUser())) return forbidden;
  const parsed = participantSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: id.participant.errors.saveFailed };
  try {
    const staff = data().staff;
    const created = await staff.createParticipant(toParticipant(parsed.data));
    await staff.logEvent(created.business.id, "profil_selesai", {
      sektor: parsed.data.sector,
      lokasi: parsed.data.location,
    });
    revalidatePath(ROUTES.researcher);
    return { ok: true, data: { businessId: created.business.id } };
  } catch {
    return { ok: false, error: id.participant.errors.saveFailed };
  }
}

export async function updateParticipantAction(
  businessId: string,
  values: ParticipantInput,
): Promise<Result<{ businessId: string }>> {
  if (!(await getStaffUser())) return forbidden;
  const parsedId = businessIdSchema.safeParse(businessId);
  const parsed = participantSchema.safeParse(values);
  if (!parsedId.success || !parsed.success) {
    return { ok: false, error: id.participant.errors.saveFailed };
  }
  try {
    const updated = await data().staff.updateParticipant(parsedId.data, toParticipant(parsed.data));
    if (!updated) return { ok: false, error: id.participant.errors.saveFailed };
    revalidatePath(ROUTES.researcher, "layout");
    return { ok: true, data: { businessId: parsedId.data } };
  } catch {
    return { ok: false, error: id.participant.errors.saveFailed };
  }
}

const questionnaireSchema = z.object({
  businessId: businessIdSchema,
  field: z.enum(["sent", "done"]),
  value: z.boolean(),
});

/** "Kirim kuesioner" (sent) and "Tandai sudah isi" (done); `value: false` undoes a mistake. */
export async function setQuestionnaireAction(
  businessId: string,
  field: "sent" | "done",
  value: boolean,
): Promise<Result<null>> {
  if (!(await getStaffUser())) return forbidden;
  const parsed = questionnaireSchema.safeParse({ businessId, field, value });
  if (!parsed.success) return { ok: false, error: id.researcher.markFailed };
  try {
    const at = parsed.data.value ? new Date().toISOString() : null;
    const staff = data().staff;
    const saved = await staff.setQuestionnaire(parsed.data.businessId, parsed.data.field, at);
    if (!saved) return { ok: false, error: id.researcher.markFailed };
    // "Sudah isi" implies the link was sent; keeps the funnel consistent if a step was skipped.
    if (parsed.data.field === "done" && parsed.data.value) {
      const participant = await staff.getParticipant(parsed.data.businessId);
      if (!participant?.pack?.questionnaireSentAt) {
        await staff.setQuestionnaire(parsed.data.businessId, "sent", at);
      }
    }
    revalidatePath(ROUTES.researcher, "layout");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: id.researcher.markFailed };
  }
}

async function adminOnly(): Promise<boolean> {
  return (await getStaffUser())?.role === "admin";
}

export async function inviteAction(values: {
  email: string;
  role: string;
}): Promise<Result<TeamInvite>> {
  if (!(await adminOnly())) return forbidden;
  const parsed = inviteSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: id.team.errors.emailInvalid };
  try {
    const result = await data().staff.invite(parsed.data.email, parsed.data.role);
    if (!result.ok) return { ok: false, error: id.team.errors[result.reason] };
    revalidatePath(ROUTES.team);
    return { ok: true, data: result.invite };
  } catch {
    return { ok: false, error: id.team.errors.failed };
  }
}

export async function removeInviteAction(email: string): Promise<Result<null>> {
  if (!(await adminOnly())) return forbidden;
  const parsed = z.email().safeParse(email);
  if (!parsed.success) return { ok: false, error: id.team.errors.failed };
  try {
    await data().staff.removeInvite(parsed.data);
    revalidatePath(ROUTES.team);
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: id.team.errors.failed };
  }
}
