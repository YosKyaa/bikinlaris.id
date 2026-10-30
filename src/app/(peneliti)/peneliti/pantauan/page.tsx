import type { Metadata } from "next";

import { PrintButton } from "@/components/atoms/print-button";
import { MonitoringDashboard } from "@/components/organisms/monitoring/monitoring-dashboard";
import { MonitoringFilters } from "@/components/organisms/monitoring/monitoring-filters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { id } from "@/content/id";
import { data } from "@/lib/data";
import { buildMonitoring, parseMonitoringFilters } from "@/lib/data/monitoring";
import { env, isMockData } from "@/lib/env";
import { formatDate, todayIso } from "@/lib/format";

export const metadata: Metadata = { title: id.monitoring.title };

/** Research monitoring: sample progress, who needs action, check results, usage, sample profile. */
export default async function MonitoringPage({ searchParams }: PageProps<"/peneliti/pantauan">) {
  const staff = data().staff;
  const [participants, events, team, params] = await Promise.all([
    staff.listParticipants(),
    staff.listEvents(),
    staff.listTeam(),
    searchParams,
  ]);
  const filters = parseMonitoringFilters(params, team.members);
  const today = todayIso();
  const monitoring = buildMonitoring({
    participants,
    events,
    members: team.members,
    filters,
    today,
    now: new Date(),
    deadline: env.RESEARCH_DEADLINE,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{id.monitoring.title}</h1>
          <p className="text-muted-foreground">{id.monitoring.subtitle}</p>
          <p className="text-sm text-muted-foreground">{id.monitoring.asOf(formatDate(today))}</p>
        </div>
        <PrintButton label={id.monitoring.print} />
      </header>

      {isMockData ? (
        <Alert>
          <AlertDescription className="text-foreground">
            {id.researcher.mockBanner}
          </AlertDescription>
        </Alert>
      ) : null}

      <MonitoringFilters
        filters={filters}
        members={team.members.map((m) => ({ id: m.id, label: m.name ?? m.email }))}
        shown={monitoring.participants}
        total={monitoring.totalParticipants}
      />
      <MonitoringDashboard monitoring={monitoring} />
    </div>
  );
}
