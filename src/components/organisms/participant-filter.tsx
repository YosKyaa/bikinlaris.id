import Link from "next/link";

import * as id from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import type { ParticipantFilter as Filter } from "@/lib/data/research";
import { cn } from "@/lib/utils";

export const FILTER_PARAM = "tahap";

/**
 * Stage filter as links, so the filtered list is shareable and works without JavaScript.
 * Other filters in the address (the pendamping filter) are kept.
 */
export function ParticipantFilter({
  filters,
  active,
  counts,
  keep = {},
}: {
  filters: readonly Filter[];
  active: Filter;
  counts: Record<Filter, number>;
  /** Address parameters to carry over, e.g. { pendamping: "saya" }. */
  keep?: Record<string, string>;
}) {
  const hrefFor = (filter: Filter) => {
    const query = new URLSearchParams(keep);
    if (filter !== "semua") query.set(FILTER_PARAM, filter);
    const search = query.toString();
    return search ? `${ROUTES.participants}?${search}` : ROUTES.participants;
  };
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
                href={hrefFor(filter)}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-xl border px-4 font-medium whitespace-nowrap transition-colors duration-150",
                  current
                    ? "border-brand-deep bg-brand-deep text-white"
                    : "bg-card hover:border-primary/40",
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
