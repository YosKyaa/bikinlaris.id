import { CheckIcon } from "lucide-react";

import { id } from "@/content/id";

import { sampleSop } from "../sample-sop-dialog";

const PREVIEW_DAYS = 7;
const PREVIEW_TICKED_DAYS = 3;

/**
 * Hero visual: a real SOP page from the bank rendered as HTML (no stock image, no tilted mockup).
 * Decorative duplicate of content that is readable in full via "Lihat contoh SOP".
 */
export function SopDocumentPreview() {
  const { sop } = sampleSop();
  const setup = sop.tasks.filter((t) => t.kind === "siapkan");
  const daily = sop.tasks.filter((t) => t.kind === "harian");

  return (
    <figure className="relative">
      <div
        aria-hidden
        className="relative overflow-hidden rounded-xl border bg-background p-5 sm:p-6"
      >
        <div className="flex items-center justify-between border-b pb-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{id.app.domain}</span>
          <span>{id.pack.sops.number(1)}</span>
        </div>
        <h2 className="mt-4 text-xl font-semibold">{sop.title}</h2>
        <p className="text-muted-foreground">{sop.goal}</p>

        <p className="mt-4 text-sm font-semibold text-muted-foreground">{id.pack.sop.setup}</p>
        <ul className="mt-2 space-y-2">
          {setup.map((task) => (
            <li key={task.id} className="flex gap-3">
              <span className="mt-1 size-5 shrink-0 rounded border-2 border-border" />
              <span>{task.text}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm font-semibold text-muted-foreground">
          {id.pack.sop.checklistTitle}
        </p>
        <div className="mt-2 space-y-2">
          {daily.map((task) => (
            <div key={task.id} className="flex items-center gap-1.5 sm:gap-2">
              <span className="min-w-0 flex-1 truncate text-sm sm:w-40 sm:flex-none">
                {task.text}
              </span>
              {Array.from({ length: PREVIEW_DAYS }, (_, day) => (
                <span
                  key={day}
                  className={
                    day < PREVIEW_TICKED_DAYS
                      ? "grid size-5 place-items-center rounded bg-primary text-xs text-primary-foreground"
                      : "size-5 rounded border-2 border-border"
                  }
                >
                  {day < PREVIEW_TICKED_DAYS ? <CheckIcon className="size-3.5" /> : null}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-background" />
      </div>
      <figcaption className="mt-3 text-center text-sm text-muted-foreground">
        {id.landing.hero.previewLabel}
      </figcaption>
    </figure>
  );
}
