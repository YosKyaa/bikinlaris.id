import { ChartCard } from "@/components/molecules/chart-card";
import { StatCard } from "@/components/molecules/stat-card";
import { Progress } from "@/components/ui/progress";
import { id } from "@/content/id";
import { PACE_WINDOW_WEEKS, type ProgramProgress as Program } from "@/lib/data/monitoring";
import { DUE_WINDOW_DAYS } from "@/lib/data/research";
import { LOCALE } from "@/lib/format";

const DECIMAL = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });

/**
 * The headline of the monitoring page, with no end date (owner request): day-30
 * questionnaires that came back, then who runs a SOP now, who reaches day 30 this week,
 * and the pace of new packs.
 */
export function ProgramProgress({ program }: { program: Program }) {
  const copy = id.monitoring.program;
  return (
    <ChartCard headingId="kemajuan-program" title={copy.title} description={copy.body}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-end">
        <div>
          <p className="text-sm text-muted-foreground">{copy.hero}</p>
          <p className="text-5xl font-bold tracking-tight">{program.done}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {copy.ofDay30(program.pastDay30, program.responsePercent)}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">{copy.meter}</p>
          <Progress
            value={program.responsePercent}
            aria-label={copy.ofDay30(program.pastDay30, program.responsePercent)}
            className="h-3"
          />
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label={copy.activeTile} value={program.active} hint={copy.activeHint} />
        <StatCard
          label={copy.upcomingTile}
          value={program.upcoming}
          hint={copy.upcomingHint(DUE_WINDOW_DAYS)}
        />
        <StatCard
          label={copy.paceTile}
          value={DECIMAL.format(program.weeklyPace)}
          hint={copy.paceHint(PACE_WINDOW_WEEKS)}
        />
      </div>
    </ChartCard>
  );
}
