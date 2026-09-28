import Link from "next/link";

import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";

/** Action: repeats the benefit with the single primary CTA. */
export function ClosingCtaSection() {
  const copy = id.landing.closing;
  return (
    <section className="bg-muted">
      <div className="reveal mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-20">
        <h2 className="text-3xl font-bold tracking-tight text-balance">{copy.title}</h2>
        <p className="mt-3 text-lg text-muted-foreground">{copy.body}</p>
        <Button asChild size="lg" className="mt-8">
          <Link href={ROUTES.login}>{id.common.startCheck}</Link>
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">{id.landing.hero.microcopy}</p>
      </div>
    </section>
  );
}
