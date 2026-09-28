import { redirect } from "next/navigation";

import { resolveOwnerStep } from "@/lib/data/flow";
import { requireOwnerPage } from "@/lib/data/session";

/**
 * /beranda has no dashboard (rejected in docs/keputusan.md). It sends the owner to their
 * current step, so "masuk lagi" always resumes where they stopped.
 */
export default async function StartPage() {
  const user = await requireOwnerPage();
  redirect(await resolveOwnerStep(user));
}
