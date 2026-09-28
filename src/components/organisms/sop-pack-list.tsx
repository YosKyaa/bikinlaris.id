"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { id } from "@/content/id";
import { trackSopOpenedAction } from "@/lib/actions/pack";
import { sopAnchor } from "@/lib/anchors";

export interface SopPackItem {
  sopId: string;
  title: string;
  goal: string;
  /** Server-rendered SopDocument body. */
  content: ReactNode;
}

/**
 * SOP accordion, first one open (spec). Opening a SOP logs `sop_buka`.
 * A link to `#sop-<id>` (e.g. "Buka SOP 1") opens that SOP as well as scrolling to it.
 */
export function SopPackList({ items }: { items: SopPackItem[] }) {
  const [open, setOpen] = useState<string[]>(items[0] ? [items[0].sopId] : []);
  const openRef = useRef(open);

  const update = useCallback((values: string[]) => {
    for (const value of values) {
      if (!openRef.current.includes(value)) void trackSopOpenedAction(value);
    }
    openRef.current = values;
    setOpen(values);
  }, []);

  useEffect(() => {
    const openFromHash = () => {
      const target = items.find((item) => window.location.hash === `#${sopAnchor(item.sopId)}`);
      if (target && !openRef.current.includes(target.sopId)) {
        update([...openRef.current, target.sopId]);
      }
    };
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [items, update]);

  return (
    <Accordion type="multiple" value={open} onValueChange={update} className="space-y-3">
      {items.map((item, index) => (
        <AccordionItem
          key={item.sopId}
          id={sopAnchor(item.sopId)}
          value={item.sopId}
          className="scroll-mt-20 rounded-xl border bg-background px-4 shadow-card transition-shadow duration-200 last:border-b hover:shadow-card-hover sm:px-5"
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
