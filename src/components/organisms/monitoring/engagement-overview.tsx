import { BarList } from "@/components/molecules/bar-list";
import { ChartCard } from "@/components/molecules/chart-card";
import { StatCard } from "@/components/molecules/stat-card";
import { id } from "@/content/id";
import type { Engagement } from "@/lib/data/monitoring";
import { LOCALE } from "@/lib/format";
import { percentOf } from "@/lib/viz";

const DECIMAL = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });

/** Passive pack usage: share of owners who came back, shared, printed; days with the pack open. */
export function EngagementOverview({ engagement }: { engagement: Engagement }) {
  const copy = id.monitoring.engagement;
  const { packs } = engagement;
  const share = (part: number) => id.monitoring.percent(percentOf(part, packs));
  const of = (part: number) => id.monitoring.ofTotal(part, packs);
  const sops = engagement.medianSopsOpened;

  return (
    <ChartCard headingId="pemakaian-paket" title={copy.title} description={copy.body}>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label={copy.reopened}
          value={share(engagement.reopened)}
          hint={of(engagement.reopened)}
        />
        <StatCard
          label={copy.sharedWa}
          value={share(engagement.sharedWa)}
          hint={of(engagement.sharedWa)}
        />
        <StatCard
          label={copy.printed}
          value={share(engagement.printed)}
          hint={of(engagement.printed)}
        />
        <StatCard
          label={copy.sopsOpened}
          value={sops === null ? null : DECIMAL.format(sops)}
          hint={copy.sopsOpenedHint}
        />
      </div>
      <h3 className="mt-6 font-semibold">{copy.activeTitle}</h3>
      <p className="text-sm text-muted-foreground">{copy.activeBody}</p>
      <div className="mt-3">
        <BarList
          tone="ordinal"
          total={packs}
          rows={engagement.activeDays.map((row) => ({
            key: row.key,
            label: copy.activeDays[row.key],
            value: row.value,
          }))}
        />
      </div>
    </ChartCard>
  );
}
