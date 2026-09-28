import Link from "next/link";

import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import type { FollowupFilter as Filter } from "@/lib/data/research";
import { cn } from "@/lib/utils";

export const FILTER_PARAM = "status";

/** Status filter as links, so the filtered list is shareable and works without JavaScript. */
export function FollowupFilter({
  filters,
  active,
  counts,
}: {
  filters: readonly Filter[];
  active: Filter;
  counts: Record<Filter, number>;
}) {
  return (
    <nav aria-label={id.researcher.filters.label}>
      <ul className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const current = filter === active;
          return (
            <li key={filter}>
              <Link
                href={
                  filter === "semua"
                    ? ROUTES.researcher
                    : `${ROUTES.researcher}?${FILTER_PARAM}=${filter}`
                }
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-lg border px-4 font-medium transition-colors duration-150",
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
