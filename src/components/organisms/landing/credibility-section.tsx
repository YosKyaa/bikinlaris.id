import { Eyebrow } from "@/components/atoms/eyebrow";
import { id } from "@/content/id";
import { rules, sections, totalQuestions } from "@/lib/diagnosis/bank";

/**
 * Desire: credibility on --brand-deep. The numbers are counted from the question bank,
 * not marketing claims. Lime highlights exactly one number.
 */
export function CredibilitySection() {
  const copy = id.landing.credibility;
  const facts = [
    { value: totalQuestions, label: copy.facts.questions, highlight: true },
    { value: sections.length, label: copy.facts.sections, highlight: false },
    { value: rules.maxSopPerPack, label: copy.facts.maxSop, highlight: false },
  ];

  return (
    <section className="bg-brand-deep text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div className="reveal">
          <Eyebrow tone="inverse">{copy.eyebrow}</Eyebrow>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">{copy.title}</h2>
          <p className="mt-4 text-lg text-brand-deep-muted">{copy.body}</p>
        </div>
        <ul className="grid content-center gap-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {facts.map((fact) => (
            <li key={fact.label} className="reveal border-t border-white/20 pt-4">
              <span
                className={
                  fact.highlight
                    ? "block text-5xl font-bold text-accent-lime tabular-nums"
                    : "block text-5xl font-bold tabular-nums"
                }
              >
                {fact.value}
              </span>
              <span className="mt-1 block text-brand-deep-muted">{fact.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
