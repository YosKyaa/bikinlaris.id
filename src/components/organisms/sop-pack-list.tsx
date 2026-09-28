"use client";

import { useRef, type ReactNode } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { id } from "@/content/id";
import { trackSopOpenedAction } from "@/lib/actions/pack";

export interface SopPackItem {
  sopId: string;
  title: string;
  goal: string;
  /** Server-rendered SopDocument body. */
  content: ReactNode;
}

/** SOP accordion, first one open (spec). Opening a SOP logs `sop_buka`. */
export function SopPackList({ items }: { items: SopPackItem[] }) {
  const opened = useRef(new Set<string>(items[0] ? [items[0].sopId] : []));

  return (
    <Accordion
      type="multiple"
      defaultValue={items[0] ? [items[0].sopId] : []}
      className="space-y-3"
      onValueChange={(values) => {
        for (const value of values) {
          if (!opened.current.has(value)) void trackSopOpenedAction(value);
        }
        opened.current = new Set(values);
      }}
    >
      {items.map((item, index) => (
        <AccordionItem
          key={item.sopId}
          value={item.sopId}
          className="rounded-xl border bg-background px-4 shadow-card transition-shadow duration-200 last:border-b hover:shadow-card-hover sm:px-5"
        >
          <AccordionTrigger className="py-4 hover:no-underline">
            <span className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-deep text-sm font-bold text-white tabular-nums">
                {index + 1}
              </span>
              <span>
                <span className="sr-only">{id.pack.sops.number(index + 1)}: </span>
                <span className="block text-lg font-semibold">{item.title}</span>
                <span className="block font-normal text-muted-foreground">{item.goal}</span>
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-5">{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
