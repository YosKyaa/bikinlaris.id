import { ChevronDownIcon } from "lucide-react";

import { Eyebrow } from "@/components/atoms/eyebrow";
import { id } from "@/content/id";

import { LANDING_ANCHORS } from "../site-header";

/**
 * Action: answers the usual objections before the closing CTA.
 * Native <details> instead of a JS accordion: no client JavaScript on the public page.
 */
export function FaqSection() {
  const copy = id.landing.faq;
  return (
    <section id={LANDING_ANCHORS.faq} className="scroll-mt-20">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">{copy.title}</h2>
        <div className="mt-8 divide-y border-y">
          {copy.items.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDownIcon
                  aria-hidden
                  className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="pb-5 text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
