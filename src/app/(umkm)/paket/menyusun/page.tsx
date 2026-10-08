import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PackGenerationProgress } from "@/components/organisms/pack-generation-progress";
import { FocusLayout } from "@/components/templates/focus-layout";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { resolveOwnerStep } from "@/lib/data/flow";
import { requireOwnerState } from "@/lib/data/owner-session";
import { getSop } from "@/lib/diagnosis/bank";

export const metadata: Metadata = { title: id.pack.eyebrow };

/** The Claude call can take up to 15 s (lib/diagnosis/personalize.ts); leave headroom. */
export const maxDuration = 30;

export default async function GeneratingPage() {
  const state = await requireOwnerState();
  const { business, pack } = state;
  if (!pack) redirect(resolveOwnerStep(state) ?? ROUTES.start);
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
