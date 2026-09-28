import { id } from "@/content/id";

export interface Testimonial {
  quote: string;
  name: string;
  business: string;
}

/**
 * Prepared but NOT rendered: CLAUDE.md forbids invented testimonials. Render only with real,
 * consented quotes from participants.
 */
export function TestimonialSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight">{id.landing.testimonials.title}</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {testimonials.map((t) => (
            <li key={t.name} className="rounded-xl border p-6">
              <blockquote className="text-lg">“{t.quote}”</blockquote>
              <p className="mt-4 font-semibold">{t.name}</p>
              <p className="text-muted-foreground">{t.business}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
