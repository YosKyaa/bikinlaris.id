"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { id } from "@/content/id";
import { cn } from "@/lib/utils";

export interface HowStep {
  title: string;
  body: string;
  /** Server-rendered snippet of the real screen for this step. */
  preview: ReactNode;
}

/**
 * Numbered steps as tabs: choosing a step shows what that screen looks like.
 * Arrow keys move between steps (WAI-ARIA tabs pattern, automatic activation).
 */
export function HowItWorksTabs({ steps }: { steps: HowStep[] }) {
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
    <div className="grid gap-6 *:min-w-0 md:grid-cols-[1fr_1.2fr] lg:gap-12">
      <div
        role="tablist"
        aria-label={id.landing.how.tabsLabel}
        aria-orientation="vertical"
        className="grid gap-3"
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
                "group flex gap-4 rounded-xl border-2 p-4 text-left transition-colors duration-200 sm:p-5",
                selected
                  ? "border-primary bg-success-soft shadow-card-hover"
                  : "border-border bg-background shadow-card hover:border-primary/40 hover:shadow-card-hover",
              )}
            >
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-lg text-xl font-bold tabular-nums transition-colors duration-200",
                  selected ? "bg-primary text-primary-foreground" : "bg-muted text-primary",
                )}
              >
                {index + 1}
              </span>
              <span>
                <span className="block text-xl font-semibold">{step.title}</span>
                <span className="mt-1 block text-muted-foreground">{step.body}</span>
              </span>
            </button>
          );
        })}
      </div>

      {steps.map((step, index) =>
        index === active ? (
          <div
            key={step.title}
            id={`${baseId}-panel-${index}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${index}`}
            tabIndex={0}
            className="animate-fade-up rounded-xl border bg-muted/60 p-4 shadow-card sm:p-6"
          >
            <p className="mb-3 text-sm font-semibold text-muted-foreground">
              {id.landing.how.exampleLabel}
            </p>
            {step.preview}
          </div>
        ) : null,
      )}
    </div>
  );
}
