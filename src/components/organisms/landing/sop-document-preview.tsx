import { HandIcon } from "lucide-react";

import { id } from "@/content/id";

import { sampleSop } from "../sample-sop-dialog";
import { InteractiveChecklist } from "./interactive-checklist";

/**
 * Hero visual: a real SOP page from the bank rendered as HTML (no stock image, no tilted mockup).
 * The tick table is live: it ticks a few days by itself, then the visitor can try it.
 */
export function SopDocumentPreview() {
  const { sop } = sampleSop();
  const setup = sop.tasks.filter((t) => t.kind === "siapkan");
  const daily = sop.tasks.filter((t) => t.kind === "harian");

  return (
    <figure className="relative">
      <div className="rounded-xl border bg-background p-5 sm:p-6">
        <div className="flex items-center justify-between border-b pb-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{id.app.domain}</span>
          <span>{id.pack.sops.number(1)}</span>
        </div>
        <p className="mt-4 text-xl font-semibold">{sop.title}</p>
        <p className="text-muted-foreground">{sop.goal}</p>

        <p className="mt-4 text-sm font-semibold text-muted-foreground">{id.pack.sop.setup}</p>
        <ul className="mt-2 space-y-2">
          {setup.map((task) => (
            <li key={task.id} className="flex gap-3">
              <span aria-hidden className="mt-1 size-5 shrink-0 rounded border-2 border-border" />
              <span>{task.text}</span>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-sm font-semibold text-muted-foreground">
          {id.pack.sop.checklistTitle}
        </p>
        <div className="mt-2">
          <InteractiveChecklist rows={daily.map((t) => ({ id: t.id, label: t.text }))} />
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <HandIcon aria-hidden className="size-4 text-primary" />
          {id.landing.hero.previewHint}
        </p>
      </div>
      <figcaption className="mt-3 text-center text-sm text-muted-foreground">
        {id.landing.hero.previewLabel}
      </figcaption>
    </figure>
  );
}
