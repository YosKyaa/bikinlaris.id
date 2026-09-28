"use server";

import { id } from "@/content/id";
import { saveBusinessProfile } from "@/lib/data/account";
import { logEvent } from "@/lib/data/events";
import { getSessionUser, isResearcher } from "@/lib/data/session";
import type { Result } from "@/lib/data/types";
import { businessProfileSchema, type BusinessProfile } from "@/lib/validations/business";

export async function saveProfileAction(values: BusinessProfile): Promise<Result<null>> {
  const user = await getSessionUser();
  if (!user || isResearcher(user)) return { ok: false, error: id.auth.errors.sessionExpired };

  const parsed = businessProfileSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: id.profile.errors.saveFailed };

  const { businessId, created } = await saveBusinessProfile(user, parsed.data);
  if (created) {
    await logEvent(businessId, "profil_selesai", {
      sektor: parsed.data.sector,
      lokasi: parsed.data.location,
    });
  }
  return { ok: true, data: null };
}
