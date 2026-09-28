import { Eyebrow } from "@/components/atoms/eyebrow";
import { id } from "@/content/id";
import { rules, sections, totalQuestions } from "@/lib/diagnosis/bank";

import { LANDING_ANCHORS } from "../site-header";

/** Interest: three numbered steps. */
export function HowItWorksSection() {
  const copy = id.landing.how;
  const [check, map, pack] = copy.steps;
  const steps = [
    { title: check.title, body: check.body(totalQuestions, sections.length) },
    { title: map.title, body: map.body() },
    { title: pack.title, body: pack.body(rules.maxSopPerPack) },
  ];

  return (
    <section id={LANDING_ANCHORS.how} className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">{copy.title}</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-primary pt-5">
              <span className="text-4xl font-bold text-primary tabular-nums">{index + 1}</span>
              <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
              <p className="mt-1 text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
