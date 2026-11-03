import { Eyebrow } from "@/components/atoms/eyebrow";
import { id } from "@/content/id";

/** Interest: everyday situations as plain sentences. A list, not an icon-card grid. */
export function ProblemSection() {
  const copy = id.landing.problems;
  return (
    <section className="bg-linear-to-b from-background via-success-soft to-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="reveal">
          <Eyebrow tone="pill">{copy.eyebrow}</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">{copy.title}</h2>
        </div>
        <ul className="mt-8 space-y-3">
          {copy.items.map((item) => (
            <li
              key={item}
              className="reveal-left relative overflow-hidden rounded-xl bg-background py-4 pr-5 pl-7 text-lg font-medium shadow-card transition-shadow duration-200 before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-linear-to-b before:from-primary before:to-accent-lime hover:shadow-card-hover sm:text-xl"
            >
              “{item}”
            </li>
          ))}
        </ul>
        <p className="reveal mt-8 text-lg text-muted-foreground">{copy.closing}</p>
      </div>
    </section>
  );
}
