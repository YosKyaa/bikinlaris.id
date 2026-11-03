"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { BentoGrid, TILE_TONES } from "@/components/atoms/bento-tile";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { id } from "@/content/id";
import { cn } from "@/lib/utils";

export interface HowStep {
  title: string;
  body: string;
  /** Server-rendered snippet of the real screen for this step. */
  preview: ReactNode;
}

/**
 * Numbered steps as tiles that work as tabs: choosing a step shows what that screen looks like
 * in the mint tile beside them. Arrow keys move between steps (WAI-ARIA tabs, automatic
 * activation). The selected step turns --brand-deep.
 */
export function HowItWorksTabs({ steps, heading }: { steps: HowStep[]; heading: ReactNode }) {
  const baseId = useId();
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = steps.length - 1;
    const next =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <BentoGrid className="md:grid-cols-[1fr_1.2fr]">
      <div className="grid content-start gap-3 sm:gap-4">
        {heading}
        <div
          role="tablist"
          aria-label={id.landing.how.tabsLabel}
          aria-orientation="vertical"
          className="grid gap-3 sm:gap-4"
        >
          {steps.map((step, index) => {
            const selected = index === active;
            return (
              <button
                key={step.title}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                id={`${baseId}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${index}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  "flex gap-4 rounded-2xl border p-4 text-left transition-colors duration-200 sm:p-5",
                  selected
                    ? `border-transparent ${TILE_TONES.deep}`
                    : "bg-card hover:border-primary/50",
                )}
              >
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-xl text-xl font-bold tabular-nums transition-colors duration-200",
                    selected ? "bg-accent-lime text-brand-deep" : "bg-success-soft text-success",
                  )}
                >
                  {index + 1}
                </span>
                <span>
                  <span className="block text-xl font-semibold">{step.title}</span>
                  <span
                    className={cn(
                      "mt-1 block",
                      selected ? "text-brand-deep-muted" : "text-muted-foreground",
                    )}
                  >
                    {step.body}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {steps.map((step, index) =>
        index === active ? (
          <div
            key={step.title}
            id={`${baseId}-panel-${index}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${index}`}
            tabIndex={0}
            className={cn("flex flex-col rounded-2xl p-4 sm:p-6", TILE_TONES.mint)}
          >
            <Eyebrow tone="chip" className="self-start">
              {id.landing.how.exampleLabel}
            </Eyebrow>
            <div className="my-auto animate-fade-up pt-4">{step.preview}</div>
          </div>
        ) : null,
      )}
    </BentoGrid>
  );
}
