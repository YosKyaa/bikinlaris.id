import Link from "next/link";

import { EmptyState } from "@/components/molecules/empty-state";
import { Badge } from "@/components/ui/badge";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import type { DueGroup, DueItem } from "@/lib/data/types";
import { formatDate } from "@/lib/format";

import { MarkContactedButton } from "./mark-contacted-button";

const GROUP_VARIANT = {
  overdue: "danger",
  today: "warning",
  tomorrow: "secondary",
  later: "outline",
} as const;

interface Group {
  key: string;
  group: DueGroup;
  items: DueItem[];
}

/** Items arrive sorted by date; "later" items get one group per date. */
function groupItems(items: DueItem[]): Group[] {
  const groups: Group[] = [];
  for (const item of items) {
    const key = item.group === "later" ? item.followUpOn : item.group;
    const last = groups.at(-1);
    if (last?.key === key) last.items.push(item);
    else groups.push({ key, group: item.group, items: [item] });
  }
  return groups;
}

/** The enumerator's to-do list: who to contact for the day-30 questionnaire, grouped by date. */
export function DueThisWeek({ items, windowDays }: { items: DueItem[]; windowDays: number }) {
  const copy = id.researcher.due;
  const groups = groupItems(items);

  return (
    <section
      aria-labelledby="hubungi-minggu-ini"
      className="rounded-xl border bg-background p-5 shadow-card sm:p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="hubungi-minggu-ini" className="text-xl font-semibold">
          {copy.title}
        </h2>
        <span className="text-2xl font-bold tabular-nums">{items.length}</span>
      </div>
      <p className="mt-1 text-muted-foreground">{copy.body(windowDays)}</p>

      {groups.length === 0 ? (
        <EmptyState className="mt-5" title={copy.emptyTitle} body={copy.emptyBody} />
      ) : (
        <div className="mt-5 space-y-5">
          {groups.map(({ key, group, items: entries }) => (
            <div key={key}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                {group === "later" ? formatDate(key) : copy.groups[group]}
              </h3>
              <ul className="divide-y rounded-lg border">
                {entries.map((item) => (
                  <li key={item.businessId} className="flex flex-wrap items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={ROUTES.researcherBusiness(item.businessId)}
                        className="font-semibold underline-offset-4 hover:underline"
                      >
                        {item.businessName}
                      </Link>
                      <p className="text-sm break-all text-muted-foreground">
                        <a href={`mailto:${item.email}`} className="hover:underline">
                          {item.email}
                        </a>
                      </p>
                    </div>
                    <Badge variant={GROUP_VARIANT[group]}>{copy.day(item.dayNumber)}</Badge>
                    <MarkContactedButton
                      businessId={item.businessId}
                      businessName={item.businessName}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
