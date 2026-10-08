import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OwnerWelcome } from "@/components/organisms/owner-welcome";
import { FocusLayout } from "@/components/templates/focus-layout";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { resolveOwnerStep } from "@/lib/data/flow";
import { requireOwnerState } from "@/lib/data/owner-session";
import { sections } from "@/lib/diagnosis/bank";

export const metadata: Metadata = { title: id.owner.welcome.start };

/**
 * /beranda has no dashboard (docs/keputusan.md). It resumes at the owner's current step;
 * only a diagnosis that has not started yet shows the welcome screen.
 */
export default async function StartPage() {
  const state = await requireOwnerState();
  const step = resolveOwnerStep(state);
  if (step) redirect(step);

  const { business } = state;
  return (
    <FocusLayout>
      <OwnerWelcome
        code={business.code}
        ownerName={business.ownerName}
        businessName={business.name}
        startHref={ROUTES.diagnosisArea(sections[0].id)}
      />
    </FocusLayout>
  );
}
