import { Eyebrow } from "@/components/atoms/eyebrow";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { id } from "@/content/id";

import { LANDING_ANCHORS } from "../site-header";

/** Action: answers the usual objections before the closing CTA. */
export function FaqSection() {
  const copy = id.landing.faq;
  return (
    <section id={LANDING_ANCHORS.faq} className="scroll-mt-20">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">{copy.title}</h2>
        <Accordion type="single" collapsible className="mt-8 border-t">
          {copy.items.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-lg">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
