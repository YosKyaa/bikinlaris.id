import { CheckIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { diagnosisBank } from "@/content/diagnosis";

const SECONDS_PER_ITEM = 4;

/**
 * Running strip of real SOP titles from the bank. Decorative (the same titles are listed,
 * readable, in "Isi paket"), so it is hidden from assistive tech. Pauses on hover; static
 * under reduced motion.
 */
export function SopMarquee() {
  const titles = diagnosisBank.sops.map((sop) => sop.title);
  const style = { "--duration": `${titles.length * SECONDS_PER_ITEM}s` } as CSSProperties;

  return (
    <div aria-hidden className="marquee overflow-hidden border-y bg-background py-4">
      <div className="marquee-track flex w-max" style={style}>
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {titles.map((title) => (
              <li
                key={title}
                className="mx-3 inline-flex items-center gap-2 rounded-full border bg-muted/60 px-4 py-2 font-medium whitespace-nowrap"
              >
                <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                  <CheckIcon className="size-3.5" />
                </span>
                {title}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
