import { ROUTES } from "@/lib/auth/constants";
import { answeredCount, firstIncompleteSection } from "@/lib/diagnosis/scoring";

import type { OwnerState } from "./types";

/**
 * Where the owner should be right now. There is no dashboard (docs/keputusan.md): the
 * private link always resumes at the current step. Null = not started, show the welcome.
 */
export function resolveOwnerStep({ diagnosis, pack }: OwnerState): string | null {
  if (pack) return pack.status === "menyusun" ? ROUTES.generating : ROUTES.pack;
  const answers = diagnosis?.answers ?? {};
  if (answeredCount(answers) === 0) return null;
  const next = firstIncompleteSection(answers);
  return next ? ROUTES.diagnosisArea(next) : ROUTES.summary;
}
