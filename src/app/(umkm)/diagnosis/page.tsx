import { redirect } from "next/navigation";

import { resolveOwnerStep } from "@/lib/data/flow";
import { requireOwnerPage } from "@/lib/data/session";

/** /diagnosis resumes at the first unfinished section (or the summary). */
export default async function DiagnosisIndexPage() {
  redirect(await resolveOwnerStep(await requireOwnerPage()));
}
