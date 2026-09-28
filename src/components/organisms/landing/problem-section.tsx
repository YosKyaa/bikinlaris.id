import { Eyebrow } from "@/components/atoms/eyebrow";
import { PhotoFrame } from "@/components/molecules/photo-frame";
import { id } from "@/content/id";
import { photos } from "@/content/photos";

/** Interest: everyday situations as plain sentences next to a real stall. A list, not an icon grid. */
export function ProblemSection() {
  const copy = id.landing.problems;
  return (
    <section className="bg-muted">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 *:min-w-0 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-24">
        <div>
          <div className="reveal">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">{copy.title}</h2>
          </div>
          <ul className="mt-8 space-y-3">
            {copy.items.map((item) => (
              <li
                key={item}
                className="reveal rounded-xl border-l-4 border-primary/30 bg-background px-5 py-4 text-lg font-medium shadow-card transition-[border-color,box-shadow] duration-200 hover:border-primary hover:shadow-card-hover sm:text-xl"
              >
                “{item}”
              </li>
            ))}
          </ul>
          <p className="reveal mt-8 text-lg text-muted-foreground">{copy.closing}</p>
        </div>
        <PhotoFrame
          photo={photos.gorenganGarut}
          sizes="(min-width: 1024px) 30rem, 100vw"
          className="reveal aspect-[4/3] lg:aspect-[4/5]"
        />
      </div>
    </section>
  );
}
