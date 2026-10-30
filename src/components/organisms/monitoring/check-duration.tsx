import { BarList } from "@/components/molecules/bar-list";
import { ChartCard } from "@/components/molecules/chart-card";
import { StatCard } from "@/components/molecules/stat-card";
import { id } from "@/content/id";
import type { DurationStats } from "@/lib/data/monitoring";

interface CheckDurationProps {
  duration: DurationStats;
  sources: { template: number; llm: number };
}

/**
 * How long the check takes in the field (to settle the "sekitar 10 menit" promise), and
 * whether pack texts came from the template or from Claude.
 */
export function CheckDuration({ duration, sources }: CheckDurationProps) {
  const copy = id.monitoring.duration;
  const median = duration.medianMinutes;
  return (
    <ChartCard headingId="lama-cek" title={copy.title} description={copy.body}>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label={copy.median}
          value={median === null ? null : id.common.minutes(median)}
          hint={copy.of(duration.completed)}
        />
        <div className="rounded-xl border bg-background p-4 shadow-card print:shadow-none">
          <p className="text-sm text-muted-foreground">{copy.sources}</p>
          <dl className="mt-2 space-y-1">
            {(["template", "llm"] as const).map((key) => (
              <div key={key} className="flex justify-between gap-3">
                <dt>{copy[key]}</dt>
                <dd className="font-semibold tabular-nums">{sources[key]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="mt-6">
        <BarList
          tone="ordinal"
          total={duration.completed}
          rows={duration.buckets.map((row) => ({
            key: row.key,
            label: copy.buckets[row.key],
            value: row.value,
          }))}
        />
      </div>
    </ChartCard>
  );
}
