import { ArrowDownIcon, QuoteIcon } from "lucide-react";

import { BentoGrid, BentoTile } from "@/components/atoms/bento-tile";
import { id } from "@/content/id";
import { cn } from "@/lib/utils";

import { LandingSection, TileHeading } from "./landing-section";

/**
 * Interest: everyday situations as plain sentences, one per tile (sizes differ, so it does
 * not read as an icon-card grid). The answer to them closes the block on --brand-deep.
 */
export function ProblemSection() {
  const copy = id.landing.problems;
  return (
    <LandingSection>
      <BentoGrid className="md:grid-cols-2 lg:grid-cols-3">
        <BentoTile className="reveal flex flex-col justify-end md:col-span-2 lg:col-span-1 lg:row-span-2">
          <TileHeading eyebrow={copy.eyebrow} title={copy.title} />
        </BentoTile>
        {copy.items.map((item, index) => (
          <BentoTile
            key={item}
            as="figure"
            className={cn("reveal-scale", index === 0 && "md:col-span-2")}
          >
            <QuoteIcon aria-hidden className="size-6 text-primary" />
            <blockquote className="mt-3 text-lg font-medium text-balance sm:text-xl">
              {item}
            </blockquote>
          </BentoTile>
        ))}
        <BentoTile
          tone="deep"
          className="reveal flex items-start gap-4 md:col-span-2 lg:col-span-3 lg:items-center"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-lime text-brand-deep">
            <ArrowDownIcon aria-hidden className="size-5" />
          </span>
          <p className="text-lg font-medium text-balance sm:text-xl">{copy.closing}</p>
        </BentoTile>
      </BentoGrid>
    </LandingSection>
  );
}
