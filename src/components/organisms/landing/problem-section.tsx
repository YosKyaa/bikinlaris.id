import { Eyebrow } from "@/components/atoms/eyebrow";
import { id } from "@/content/id";

/** Interest: everyday situations as plain sentences. A list, not an icon-card grid. */
export function ProblemSection() {
  const copy = id.landing.problems;
  return (
    <section className="bg-muted">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">{copy.title}</h2>
        <ul className="mt-8 divide-y border-y">
          {copy.items.map((item) => (
            <li key={item} className="py-5 text-xl font-medium">
              “{item}”
            </li>
          ))}
        </ul>
        <p className="mt-8 text-lg text-muted-foreground">{copy.closing}</p>
      </div>
    </section>
  );
}
