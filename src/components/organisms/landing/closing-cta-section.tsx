import Link from "next/link";

import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { ENTER_APP } from "@/lib/transitions";

/**
 * Action: repeats the benefit with the single primary CTA, on a brand gradient card.
 * The button is white so it stands out on green. Only a green light, top left: lime behind
 * the grey text near --brand-mid drops below AA.
 */
export function ClosingCtaSection() {
  const copy = id.landing.closing;
  return (
    <section className="bg-linear-to-b from-background to-success-soft px-4 py-16 sm:px-6 lg:py-24">
      <div className="reveal-scale relative isolate mx-auto max-w-5xl overflow-hidden rounded-xl bg-linear-135 from-brand-deep to-brand-mid px-6 py-12 text-center text-white shadow-float sm:px-12 lg:py-16">
        <div
          aria-hidden
          className="drift pointer-events-none absolute -top-32 -left-32 -z-10 size-[28rem] bg-radial from-primary/50 to-transparent to-70%"
        />
        <h2 className="text-3xl font-bold tracking-tight text-balance">{copy.title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-brand-deep-muted">{copy.body}</p>
        <Button
          asChild
          size="lg"
          className="btn-shine mt-8 bg-white text-brand-deep hover:bg-white/90"
        >
          <Link href={ROUTES.signup} transitionTypes={ENTER_APP}>
            {id.common.join}
          </Link>
        </Button>
        <p className="mt-4 text-sm text-brand-deep-muted">{id.landing.hero.microcopy}</p>
      </div>
    </section>
  );
}
