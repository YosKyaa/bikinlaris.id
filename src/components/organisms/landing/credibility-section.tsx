import type { CSSProperties } from "react";

import { BentoGrid, BentoTile, type TileTone } from "@/components/atoms/bento-tile";
import { id } from "@/content/id";
import { rules, sections, totalQuestions } from "@/lib/diagnosis/bank";
import { cn } from "@/lib/utils";

import { LandingSection, TileHeading } from "./landing-section";

/**
 * Desire: who made this, on --brand-deep, beside three number tiles. The numbers are counted
 * from the question bank, not marketing claims, and count up as they scroll in.
 */
export function CredibilitySection() {
  const copy = id.landing.credibility;
  const facts: { value: number; label: string; tone: TileTone; className: string }[] = [
    {
      value: totalQuestions,
      label: copy.facts.questions,
      tone: "lime",
      className: "col-span-2 lg:col-span-6",
    },
    {
      value: sections.length,
      label: copy.facts.sections,
      tone: "card",
      className: "lg:col-span-3",
    },
    {
      value: rules.maxSopPerPack,
      label: copy.facts.maxSop,
      tone: "card",
      className: "lg:col-span-3",
    },
  ];

  return (
    <LandingSection>
      <BentoGrid className="grid-cols-2 lg:grid-cols-12">
        <BentoTile
          tone="deep"
          className="reveal-left isolate col-span-2 flex flex-col justify-center overflow-hidden p-6 sm:p-10 lg:col-span-6 lg:row-span-2"
        >
          {/* Green light behind the text keeps white 7:1 and the grey 5.4:1. */}
          <div
            aria-hidden
            className="drift pointer-events-none absolute -top-40 -left-40 -z-10 size-[32rem] bg-radial from-primary/40 to-transparent to-70%"
          />
          <TileHeading eyebrow={copy.eyebrow} title={copy.title} body={copy.body} tone="inverse" />
        </BentoTile>
        {facts.map((fact) => (
          <BentoTile
            key={fact.label}
            as="figure"
            tone={fact.tone}
            className={cn("reveal-scale flex flex-col justify-between gap-4", fact.className)}
          >
            <span
              aria-hidden
              className="count-up block text-5xl font-bold tabular-nums sm:text-6xl"
              style={{ "--target": fact.value } as CSSProperties}
            >
              <span className="count-up-value">{fact.value}</span>
            </span>
            <figcaption
              className={cn(
                "font-medium",
                fact.tone === "card" ? "text-muted-foreground" : "text-brand-deep",
              )}
            >
              <span className="sr-only">{fact.value} </span>
              {fact.label}
            </figcaption>
          </BentoTile>
        ))}
      </BentoGrid>
    </LandingSection>
  );
}
