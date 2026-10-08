import Link from "next/link";

import { EmptyState } from "@/components/molecules/empty-state";
import { Badge } from "@/components/ui/badge";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import type { DueGroup, DueItem } from "@/lib/data/types";
import { formatDate } from "@/lib/format";

import { SendQuestionnaireLink } from "./questionnaire-buttons";

const GROUP_VARIANT = {
  overdue: "danger",
  today: "warning",
  tomorrow: "secondary",
  later: "outline",
} as const;

export type DueEntry = DueItem & {
  /** WhatsApp link with the questionnaire message; null until SURVEY_URL is set. */
  sendHref: string | null;
};

interface Group {
  key: string;
  group: DueGroup;
  items: DueEntry[];
}

/** Items arrive sorted by date; "later" items get one group per date. */
function groupItems(items: DueEntry[]): Group[] {
  const groups: Group[] = [];
  for (const item of items) {
    const key = item.group === "later" ? item.followUpOn : item.group;
    const last = groups.at(-1);
    if (last?.key === key) last.items.push(item);
    else groups.push({ key, group: item.group, items: [item] });
  }
  return groups;
}

/** The enumerator's to-do list: who gets the day-30 questionnaire this week, grouped by date. */
export function DueThisWeek({ items, windowDays }: { items: DueEntry[]; windowDays: number }) {
  const copy = id.researcher.due;
  const groups = groupItems(items);
  const surveyMissing = items.some((item) => item.sendHref === null);

  return (
    <section
      aria-labelledby="kirim-minggu-ini"
      className="rounded-xl border bg-background p-5 shadow-card sm:p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="kirim-minggu-ini" className="text-xl font-semibold">
          {copy.title}
        </h2>
        <span className="text-2xl font-bold tabular-nums">{items.length}</span>
      </div>
      <p className="mt-1 text-muted-foreground">{copy.body(windowDays)}</p>
      {surveyMissing ? (
        <p className="mt-3 rounded-lg bg-warning-soft p-3 text-sm text-warning">{copy.noSurvey}</p>
      ) : null}

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
                    <div className="min-w-40 flex-1">
                      <Link
                        href={ROUTES.researcherBusiness(item.businessId)}
                        className="inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline"
                      >
                        {item.businessName}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-mono">{item.code}</span> · {item.ownerName}
                      </p>
                    </div>
                    <Badge variant={GROUP_VARIANT[group]}>{copy.day(item.dayNumber)}</Badge>
                    {group === "later" ? (
                      <span className="text-sm text-muted-foreground">{copy.notYet}</span>
                    ) : item.sendHref ? (
                      <SendQuestionnaireLink
                        businessId={item.businessId}
                        businessName={item.businessName}
                        href={item.sendHref}
                        label={id.researcher.actions.sendQuestionnaire}
                        variant="outline"
                        size="sm"
                      />
                    ) : null}
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
