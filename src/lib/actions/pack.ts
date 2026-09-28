"use server";

import { z } from "zod";

import { id } from "@/content/id";
import { logEvent, logEventOncePerDay } from "@/lib/data/events";
import { getPack } from "@/lib/data/pack";
import { getSessionUser, isResearcher } from "@/lib/data/session";
import type { Result } from "@/lib/data/types";
import { dayNumber } from "@/lib/format";
import { sopIdSchema } from "@/lib/validations/diagnosis";

/** Passive research events from the pack page (spec events). Failures never block the user. */
async function ownerPack() {
  const user = await getSessionUser();
  if (!user || isResearcher(user) || !user.businessId) return null;
  return getPack(user.businessId);
}

const expired = { ok: false, error: id.auth.errors.sessionExpired } as const;

export async function trackPackOpenedAction(): Promise<Result<null>> {
  const pack = await ownerPack();
  if (!pack) return expired;
  await logEventOncePerDay(pack.businessId, "hasil_buka", { hari: dayNumber(pack.createdOn) });
  return { ok: true, data: null };
}

export async function trackSopOpenedAction(sopId: string): Promise<Result<null>> {
  const pack = await ownerPack();
  const parsed = sopIdSchema.safeParse(sopId);
  if (!pack || !parsed.success) return expired;
  await logEvent(pack.businessId, "sop_buka", { sop: parsed.data });
  return { ok: true, data: null };
}

const shareSchema = z.enum(["kirim_wa", "cetak"]);

export async function trackShareAction(action: string): Promise<Result<null>> {
  const pack = await ownerPack();
  const parsed = shareSchema.safeParse(action);
  if (!pack || !parsed.success) return expired;
  await logEvent(pack.businessId, parsed.data);
  return { ok: true, data: null };
}
