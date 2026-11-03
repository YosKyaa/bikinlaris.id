import { ChevronDownIcon } from "lucide-react";

import { BentoGrid, BentoTile } from "@/components/atoms/bento-tile";
import { id } from "@/content/id";

import { LANDING_ANCHORS } from "../site-header";
import { LandingSection, TileHeading } from "./landing-section";

/**
 * Action: answers the usual objections before the closing CTA. Heading tile on the left
 * (sticky on laptops), one tile per question. Native <details>: no client JavaScript.
 */
export function FaqSection() {
  const copy = id.landing.faq;
  return (
    <LandingSection id={LANDING_ANCHORS.faq}>
      <BentoGrid className="lg:grid-cols-[1fr_2fr]">
        <BentoTile className="reveal lg:sticky lg:top-24 lg:self-start">
          <TileHeading eyebrow={copy.eyebrow} title={copy.title} />
        </BentoTile>
        <div className="grid gap-3">
          {copy.items.map((item) => (
            <details
              key={item.q}
              className="group reveal rounded-2xl border bg-card transition-colors duration-150 open:border-primary/40"
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-lg font-semibold transition-colors duration-150 hover:text-primary sm:px-6 [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-success-soft text-success transition-transform duration-200 group-open:rotate-180">
                  <ChevronDownIcon aria-hidden className="size-5" />
                </span>
              </summary>
              <p className="px-5 pb-5 text-muted-foreground sm:px-6">{item.a}</p>
            </details>
          ))}
        </div>
      </BentoGrid>
    </LandingSection>
  );
}
