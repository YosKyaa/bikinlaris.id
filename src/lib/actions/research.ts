"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { data } from "@/lib/data";
import { getStaffUser } from "@/lib/data/staff-session";
import type { NewParticipant, Result, TeamInvite } from "@/lib/data/types";
import { inviteSchema, STAFF_ROLES } from "@/lib/validations/auth";
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
    revalidatePath(ROUTES.researcher, "layout");
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

/** Supabase user ids are UUIDs; the demo data uses short readable ids. */
const memberIdSchema = z.string().min(1).max(64);

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

/**
 * Admin gives a team member another role. Takes effect on the member's next page (the role is
 * read per request). Admins cannot change their own role, so the team always keeps an admin.
 */
export async function setRoleAction(userId: string, role: string): Promise<Result<null>> {
  const admin = await getStaffUser();
  if (admin?.role !== "admin") return forbidden;
  const parsedId = memberIdSchema.safeParse(userId);
  const parsedRole = z.enum(STAFF_ROLES).safeParse(role);
  if (!parsedId.success || !parsedRole.success)
    return { ok: false, error: id.team.errors.roleFailed };
  if (parsedId.data === admin.id) return { ok: false, error: id.team.errors.ownRole };
  try {
    const updated = await data().staff.setRole(parsedId.data, parsedRole.data);
    if (!updated) return { ok: false, error: id.team.errors.notMember };
    revalidatePath(ROUTES.researcher, "layout");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: id.team.errors.roleFailed };
  }
}

/** Admin lets a member go (never oneself). Their participants stay; so does their login. */
export async function removeMemberAction(userId: string): Promise<Result<null>> {
  const admin = await getStaffUser();
  if (admin?.role !== "admin") return forbidden;
  const parsed = memberIdSchema.safeParse(userId);
  if (!parsed.success) return { ok: false, error: id.team.errors.removeFailed };
  if (parsed.data === admin.id) return { ok: false, error: id.team.errors.ownRemove };
  try {
    const removed = await data().staff.removeMember(parsed.data);
    if (!removed) return { ok: false, error: id.team.errors.notMember };
    revalidatePath(ROUTES.researcher, "layout");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: id.team.errors.removeFailed };
  }
}

/**
 * Admin deletes a participant for good (e.g. test entries): answers, pack, events and coach
 * messages go with it. False from the database (no row, or the policy is not there yet) is
 * reported without technical detail.
 */
export async function deleteParticipantAction(businessId: string): Promise<Result<null>> {
  const admin = await getStaffUser();
  if (admin?.role !== "admin") return forbidden;
  const parsed = businessIdSchema.safeParse(businessId);
  if (!parsed.success) return { ok: false, error: id.researcher.remove.failed };
  try {
    const deleted = await data().staff.deleteParticipant(parsed.data);
    if (!deleted) return { ok: false, error: id.researcher.remove.notDeleted };
    revalidatePath(ROUTES.researcher, "layout");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: id.researcher.remove.failed };
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
