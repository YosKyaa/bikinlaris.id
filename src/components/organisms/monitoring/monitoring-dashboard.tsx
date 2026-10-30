import Link from "next/link";

import { EmptyState } from "@/components/molecules/empty-state";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import type { Monitoring } from "@/lib/data/monitoring";

import { ResearchFunnel } from "../research-funnel";
import { ActionAlerts } from "./action-alerts";
import { CheckDuration } from "./check-duration";
import { DiagnosisHighlights } from "./diagnosis-highlights";
import { EngagementOverview } from "./engagement-overview";
import { ProgressTimeline } from "./progress-timeline";
import { SampleProfile } from "./sample-profile";
import { SampleProgress } from "./sample-progress";
import { SectionHealth } from "./section-health";
import { SopUsage } from "./sop-usage";
import { TeamOverview } from "./team-overview";

const GRID = "grid gap-6 *:min-w-0 lg:grid-cols-2";

/**
 * The monitoring page, top to bottom in the order a researcher asks: will the sample be big
 * enough in time, who needs a nudge, what did the checks find, are the packs used, who is in.
 */
export function MonitoringDashboard({ monitoring: m }: { monitoring: Monitoring }) {
  const copy = id.monitoring.empty;
  if (m.participants === 0) {
    const filtered = m.totalParticipants > 0;
    return (
      <EmptyState
        title={filtered ? copy.filteredTitle : copy.title}
        body={filtered ? copy.filteredBody : copy.body}
        action={
          <Button asChild variant="outline">
            <Link href={filtered ? ROUTES.monitoring : ROUTES.newParticipant}>
              {filtered ? id.monitoring.filters.reset : id.researcher.menu.newParticipant}
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <SampleProgress sample={m.sample} />
      <ProgressTimeline timeline={m.timeline} />
      <div className={GRID}>
        <ActionAlerts groups={m.alerts} />
        <ResearchFunnel steps={m.funnel} />
      </div>
      {m.readyPacks === 0 ? (
        <EmptyState title={id.monitoring.health.title} body={copy.noPacks} />
      ) : (
        <>
          <SectionHealth rows={m.sectionHealth} packs={m.readyPacks} />
          <div className={GRID}>
            <DiagnosisHighlights hardest={m.hardest} problems={m.problems} packs={m.readyPacks} />
          </div>
          <div className={GRID}>
            <SopUsage rows={m.sops} />
            <EngagementOverview engagement={m.engagement} />
          </div>
        </>
      )}
      <div className={GRID}>
        <CheckDuration duration={m.duration} sources={m.sources} />
        <TeamOverview rows={m.team} />
      </div>
      <SampleProfile profile={m.profile} total={m.participants} />
    </div>
  );
}
