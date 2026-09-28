import "server-only";

import { ROUTES } from "@/lib/auth/constants";
import { firstIncompleteSection } from "@/lib/diagnosis/scoring";

import { getBusiness } from "./account";
import { getDiagnosis } from "./diagnosis";
import { getPack } from "./pack";
import type { SessionUser } from "./types";

/**
 * Where the owner should be right now. Replaces a "beranda" dashboard, which
 * docs/keputusan.md rejected: the app routes straight to the next step.
 */
export async function resolveOwnerStep(user: SessionUser): Promise<string> {
  if (!user.businessId || !(await getBusiness(user.businessId))) return ROUTES.profile;
  const pack = await getPack(user.businessId);
  if (pack) return pack.status === "menyusun" ? ROUTES.generating : ROUTES.pack;
  const diagnosis = await getDiagnosis(user.businessId);
  const next = firstIncompleteSection(diagnosis?.answers ?? {});
  return next ? ROUTES.diagnosisArea(next) : ROUTES.summary;
}
