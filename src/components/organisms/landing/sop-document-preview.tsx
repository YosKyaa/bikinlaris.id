import { HandIcon } from "lucide-react";

import { id } from "@/content/id";
import { cn } from "@/lib/utils";

import { sampleSop } from "../sample-sop-dialog";
import { InteractiveChecklist } from "./interactive-checklist";

/**
 * A real SOP page from the bank rendered as HTML (no mockup image). The tick table is live:
 * it ticks a few days by itself, then the visitor can try it.
 */
export function SopDocumentPreview({
  className,
  compact = false,
}: {
  className?: string;
  /** Title + first daily task only, to float over a photo without hiding it. */
  compact?: boolean;
}) {
  const { sop } = sampleSop();
  const daily = sop.tasks.filter((t) => t.kind === "harian").slice(0, compact ? 1 : undefined);

  return (
    <div className={cn("rounded-xl border bg-background p-5 shadow-float sm:p-6", className)}>
      <div className="flex items-center justify-between border-b pb-3 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{id.landing.hero.previewLabel}</span>
        <span>{id.pack.sops.number(1)}</span>
      </div>
      <p className={cn("font-semibold", compact ? "mt-3 text-lg" : "mt-4 text-xl")}>{sop.title}</p>
      {compact ? null : <p className="text-muted-foreground">{sop.goal}</p>}

      <p className="mt-4 text-sm font-semibold text-muted-foreground">
        {id.pack.sop.checklistTitle}
      </p>
      <div className="mt-2">
        <InteractiveChecklist rows={daily.map((t) => ({ id: t.id, label: t.text }))} />
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <HandIcon aria-hidden className="size-4 shrink-0 text-primary" />
        {id.landing.hero.previewHint}
      </p>
    </div>
  );
}
