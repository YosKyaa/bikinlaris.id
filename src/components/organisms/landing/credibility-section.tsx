import type { CSSProperties } from "react";

import { Eyebrow } from "@/components/atoms/eyebrow";
import { id } from "@/content/id";
import { rules, sections, totalQuestions } from "@/lib/diagnosis/bank";
import { cn } from "@/lib/utils";

/**
 * Desire: credibility on --brand-deep. The numbers are counted from the question bank,
 * not marketing claims, and count up as the section scrolls in. Lime highlights one number.
 */
export function CredibilitySection() {
  const copy = id.landing.credibility;
  const facts = [
    { value: totalQuestions, label: copy.facts.questions, highlight: true },
    { value: sections.length, label: copy.facts.sections, highlight: false },
    { value: rules.maxSopPerPack, label: copy.facts.maxSop, highlight: false },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-brand-deep text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="drift absolute -top-20 left-[10%] size-80 rounded-full bg-accent-lime/25 blur-3xl" />
        <div
          className="drift absolute right-[5%] -bottom-24 size-96 rounded-full bg-primary/50 blur-3xl"
          style={{ "--delay": "-7s" } as CSSProperties}
        />
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div className="reveal-left">
          <Eyebrow tone="inverse">{copy.eyebrow}</Eyebrow>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">{copy.title}</h2>
          <p className="mt-4 text-lg text-brand-deep-muted">{copy.body}</p>
        </div>
        <ul className="grid content-center gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {facts.map((fact) => (
            <li key={fact.label} className="glass-dark reveal-scale rounded-xl p-5 shadow-float">
              <span
                aria-hidden
                className={cn(
                  "count-up block text-5xl font-bold tabular-nums",
                  fact.highlight && "text-accent-lime",
                )}
                style={{ "--target": fact.value } as CSSProperties}
              >
                <span className="count-up-value">{fact.value}</span>
              </span>
              <span className="sr-only">{fact.value} </span>
              <span className="mt-1 block text-brand-deep-muted">{fact.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
