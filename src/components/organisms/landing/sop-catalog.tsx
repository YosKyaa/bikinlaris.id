"use client";

import { useState } from "react";

import { id } from "@/content/id";
import { cn } from "@/lib/utils";

export interface CatalogSection {
  id: string;
  label: string;
  description: string;
  sops: { id: string; title: string; goal: string; setup: number; daily: number; weekly: number }[];
}

/** Pick a business area to see which SOPs the pack can contain for it. */
export function SopCatalog({ sections }: { sections: CatalogSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const active = sections.find((s) => s.id === activeId) ?? sections[0];
  if (!active) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground">{id.landing.pack.listTitle}</h3>
      <div
        role="group"
        aria-label={id.landing.pack.filterLabel}
        className="mt-3 flex flex-wrap gap-2"
      >
        {sections.map((section) => {
          const selected = section.id === active.id;
          return (
            <button
              key={section.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setActiveId(section.id)}
              className={cn(
                "h-11 rounded-full border px-4 font-medium transition-colors duration-150",
                selected
                  ? "border-brand-deep bg-brand-deep text-white"
                  : "bg-background hover:border-primary/50 hover:bg-muted",
              )}
            >
              {section.label}
            </button>
          );
        })}
      </div>

      <div key={active.id} aria-live="polite" className="mt-5 animate-fade-up space-y-3">
        <p className="text-muted-foreground">{active.description}</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {active.sops.map((sop) => (
            <li
              key={sop.id}
              className="rounded-xl border bg-background p-4 shadow-card transition-[border-color,box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card-hover"
            >
              <p className="font-semibold">{sop.title}</p>
              <p className="mt-1 text-muted-foreground">{sop.goal}</p>
              <p className="mt-3 text-sm font-medium text-primary">
                {id.landing.pack.taskCount(sop.setup, sop.daily, sop.weekly)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
