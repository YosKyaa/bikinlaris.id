import Link from "next/link";

import { PhotoFrame } from "@/components/molecules/photo-frame";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { photos } from "@/content/photos";
import { ROUTES } from "@/lib/auth/constants";

/** Action: repeats the benefit with the single primary CTA, next to a real stall owner. */
export function ClosingCtaSection() {
  const copy = id.landing.closing;
  return (
    <section className="bg-muted">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 *:min-w-0 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:py-20">
        <PhotoFrame
          photo={photos.lapakYogyakarta}
          sizes="(min-width: 1024px) 28rem, 100vw"
          className="reveal aspect-[4/3] lg:aspect-[4/5]"
        />
        <div className="reveal">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {copy.title}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">{copy.body}</p>
          <Button asChild size="lg" className="mt-8">
            <Link href={ROUTES.login}>{id.common.startCheck}</Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">{id.landing.hero.microcopy}</p>
        </div>
      </div>
    </section>
  );
}
