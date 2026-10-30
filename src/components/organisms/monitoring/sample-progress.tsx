import { CircleAlertIcon, CircleCheckIcon, InfoIcon } from "lucide-react";

import { ChartCard } from "@/components/molecules/chart-card";
import { SampleMeter } from "@/components/molecules/sample-meter";
import { StatCard } from "@/components/molecules/stat-card";
import { id } from "@/content/id";
import { PACE_WINDOW_WEEKS, type SampleProgress as Progress } from "@/lib/data/monitoring";
import { formatDate, formatDateShort, LOCALE } from "@/lib/format";
import { cn } from "@/lib/utils";

const DECIMAL = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });
/** p_min as written in the methods literature: two decimals (0,25 and 0,20). */
const P_MIN = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2 });

/** What the team should do about the sample size, with a status icon and words. */
function Advice({ sample }: { sample: Progress }) {
  const copy = id.monitoring.sample;
  const { nextThreshold: next } = sample;
  const late = next !== null && sample.daysToLastPackDay < 0;
  const tone = next === null ? "good" : late ? "warning" : "info";
  const Icon = tone === "good" ? CircleCheckIcon : tone === "warning" ? CircleAlertIcon : InfoIcon;
  const text =
    next === null
      ? copy.reached
      : late
        ? copy.late(next.n)
        : copy.next(next.missing, next.n, formatDate(sample.lastPackDay));

  return (
    <div
      className={cn(
        "mt-6 flex gap-3 rounded-lg p-4",
        tone === "good" && "bg-success-soft",
        tone === "warning" && "bg-warning-soft",
        tone === "info" && "bg-muted",
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "mt-0.5 size-5 shrink-0",
          tone === "good" && "text-success",
          tone === "warning" && "text-warning",
          tone === "info" && "text-primary",
        )}
      />
      <div>
        <p className="font-medium">{text}</p>
        <p className="text-sm text-muted-foreground">{copy.assumption}</p>
      </div>
    </div>
  );
}

/** The headline: questionnaires filled in, against the minimum sample and the deadline. */
export function SampleProgress({ sample }: { sample: Progress }) {
  const copy = id.monitoring.sample;
  return (
    <ChartCard headingId="kemajuan-sampel" title={copy.title} description={copy.body}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-end">
        <div>
          <p className="text-sm text-muted-foreground">{copy.hero}</p>
          <p className="text-5xl font-bold tracking-tight">{sample.done}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {copy.deadline(formatDate(sample.deadline))}
          </p>
        </div>
        <div className="space-y-3">
          <SampleMeter
            label={copy.meter}
            done={sample.done}
            reachable={sample.reachable}
            thresholds={sample.thresholds}
            doneLabel={copy.done}
            reachableLabel={copy.reachable}
          />
          <p className="text-sm text-muted-foreground">
            {copy.thresholdsNote}{" "}
            {sample.thresholds.map((t) => copy.threshold(t.n, P_MIN.format(t.pMin))).join(" · ")}
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label={copy.reachableTile} value={sample.reachable} hint={copy.reachableHint} />
        <StatCard
          label={copy.lastPackTile}
          value={formatDateShort(sample.lastPackDay)}
          hint={copy.lastPackHint(sample.daysToLastPackDay)}
        />
        <StatCard
          label={copy.paceTile}
          value={DECIMAL.format(sample.weeklyPace)}
          hint={copy.paceHint(PACE_WINDOW_WEEKS)}
        />
      </div>
      <Advice sample={sample} />
    </ChartCard>
  );
}
