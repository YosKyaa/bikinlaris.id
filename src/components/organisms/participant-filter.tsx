import Link from "next/link";

import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import type { ParticipantFilter as Filter } from "@/lib/data/research";
import { cn } from "@/lib/utils";

export const FILTER_PARAM = "tahap";

/** Stage filter as links, so the filtered list is shareable and works without JavaScript. */
export function ParticipantFilter({
  filters,
  active,
  counts,
}: {
  filters: readonly Filter[];
  active: Filter;
  counts: Record<Filter, number>;
}) {
  return (
    <nav
      aria-label={id.researcher.filters.label}
      className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
    >
      <ul className="flex gap-2 sm:flex-wrap">
        {filters.map((filter) => {
          const current = filter === active;
          return (
            <li key={filter} className="shrink-0">
              <Link
                href={
                  filter === "semua"
                    ? ROUTES.researcher
                    : `${ROUTES.researcher}?${FILTER_PARAM}=${filter}`
                }
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-lg border px-4 font-medium whitespace-nowrap transition-colors duration-150",
                  current
                    ? "border-foreground bg-foreground text-background"
                    : "bg-background hover:bg-muted",
                )}
              >
                {id.researcher.filters[filter]}
                <span className="tabular-nums opacity-80">{counts[filter]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
