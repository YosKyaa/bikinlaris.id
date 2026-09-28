import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PackGenerationProgress } from "@/components/organisms/pack-generation-progress";
import { FocusLayout } from "@/components/templates/focus-layout";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { getBusiness } from "@/lib/data/account";
import { resolveOwnerStep } from "@/lib/data/flow";
import { getPack } from "@/lib/data/pack";
import { requireOwnerPage } from "@/lib/data/session";
import { getSop } from "@/lib/diagnosis/bank";

export const metadata: Metadata = { title: id.pack.eyebrow };

export default async function GeneratingPage() {
  const user = await requireOwnerPage();
  const pack = user.businessId ? await getPack(user.businessId) : null;
  const business = user.businessId ? await getBusiness(user.businessId) : null;
  if (!pack || !business) redirect(await resolveOwnerStep(user));
  if (pack.status === "siap") redirect(ROUTES.pack);

  return (
    <FocusLayout>
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{id.generating.title(business.name)}</h1>
        <p className="text-muted-foreground">{id.generating.subtitle}</p>
      </header>
      <PackGenerationProgress
        sops={pack.sops.map((sop) => ({ id: sop.sopId, title: getSop(sop.sopId).title }))}
      />
    </FocusLayout>
  );
}
