import { ChevronDownIcon, CircleHelpIcon } from "lucide-react";

import { BentoTile } from "@/components/atoms/bento-tile";
import * as id from "@/content/id";
import { cn } from "@/lib/utils";

/**
 * "Cara pakai paket ini": what an SOP is, six numbered steps, and answers to the usual
 * worries. Open by default in the first days, folded afterwards so the documents come first.
 * Native <details>: works without JavaScript on low-end phones.
 */
export function SopGuide({ open, className }: { open: boolean; className?: string }) {
  const copy = id.pack.guide;
  return (
    <BentoTile as="section" aria-labelledby="cara-pakai" className={cn("print:hidden", className)}>
      <details open={open} className="group">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <h2 id="cara-pakai" className="text-lg font-semibold">
            {copy.title}
          </h2>
          <ChevronDownIcon
            aria-hidden
            className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          />
        </summary>
        <p className="mt-2 text-muted-foreground">{copy.intro}</p>
        <ol className="mt-4 space-y-4">
          {copy.steps.map((step, index) => (
            <li key={step.title} className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-deep text-sm font-bold text-white tabular-nums">
                {index + 1}
              </span>
              <span className="pt-1">
                <span className="block font-semibold">{step.title}</span>
                <span className="block text-muted-foreground">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-5 rounded-xl bg-muted p-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <CircleHelpIcon aria-hidden className="size-5 shrink-0 text-primary" />
            {copy.faqTitle}
          </h3>
          <dl className="mt-3 space-y-3">
            {copy.faq.map((item) => (
              <div key={item.question}>
                <dt className="font-medium">{item.question}</dt>
                <dd className="text-muted-foreground">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </details>
    </BentoTile>
  );
}
