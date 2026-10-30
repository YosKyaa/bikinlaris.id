import {
  CircleCheckIcon,
  ClockIcon,
  LinkIcon,
  LoaderIcon,
  PauseIcon,
  SendIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { ChartCard } from "@/components/molecules/chart-card";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { ALERT_PREVIEW, type AlertGroup, type AlertKind } from "@/lib/data/monitoring";

const ICONS: Record<AlertKind, LucideIcon> = {
  sendOverdue: SendIcon,
  awaitingAnswer: ClockIcon,
  stalled: PauseIcon,
  notStarted: LinkIcon,
  packStuck: LoaderIcon,
};

function Group({ group }: { group: AlertGroup }) {
  const copy = id.monitoring.alerts.kinds[group.kind];
  const Icon = ICONS[group.kind];
  const hidden = group.items.length - ALERT_PREVIEW;
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-warning" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">
            {copy.title}{" "}
            <span className="text-muted-foreground tabular-nums">({group.items.length})</span>
          </h3>
          <p className="text-sm text-muted-foreground">{copy.body}</p>
          <ul className="mt-2 space-y-1">
            {group.items.slice(0, ALERT_PREVIEW).map((item) => (
              <li key={item.businessId} className="flex flex-wrap items-baseline gap-x-2">
                <Link
                  href={ROUTES.researcherBusiness(item.businessId)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg font-medium text-primary underline-offset-4 hover:underline sm:min-h-8"
                >
                  <span className="font-mono text-sm">{item.code}</span>
                  <span className="break-words">{item.businessName}</span>
                </Link>
                <span className="text-sm text-muted-foreground">{copy.days(item.days)}</span>
              </li>
            ))}
          </ul>
          {hidden > 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {id.monitoring.alerts.more(hidden)}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/** "Perlu tindakan": the rule-based to-do list for the team, grouped by situation. */
export function ActionAlerts({ groups }: { groups: AlertGroup[] }) {
  const copy = id.monitoring.alerts;
  const open = groups.filter((group) => group.items.length > 0);
  return (
    <ChartCard headingId="perlu-tindakan" title={copy.title} description={copy.body}>
      {open.length === 0 ? (
        <p className="flex items-center gap-2 rounded-lg bg-success-soft p-4 font-medium">
          <CircleCheckIcon aria-hidden className="size-5 shrink-0 text-success" />
          {copy.none}
        </p>
      ) : (
        <ul className="divide-y">
          {open.map((group) => (
            <Group key={group.kind} group={group} />
          ))}
        </ul>
      )}
    </ChartCard>
  );
}
