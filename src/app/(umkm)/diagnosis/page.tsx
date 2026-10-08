import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/auth/constants";
import { resolveOwnerStep } from "@/lib/data/flow";
import { requireOwnerState } from "@/lib/data/owner-session";

/** /diagnosis resumes at the first unfinished section (or the summary, or the welcome). */
export default async function DiagnosisIndexPage() {
  redirect(resolveOwnerStep(await requireOwnerState()) ?? ROUTES.start);
}
