import { BentoTile } from "@/components/atoms/bento-tile";
import { ChartCard } from "@/components/molecules/chart-card";
import { ChartLegend } from "@/components/molecules/chart-legend";
import { DailyColumns } from "@/components/molecules/daily-columns";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as id from "@/content/id";
import type { CoachUsageDay } from "@/lib/data/types";
import { formatDayMonth, formatDecimal, formatNumber } from "@/lib/format";
import { percentOf } from "@/lib/viz";

const TOKENS_PER_PRICE_UNIT = 1_000_000;

/** Same hues as the other panel charts: green = done, amber = check, blue = app, red = failed. */
const SERIES = [
  { key: "answered", fill: "var(--viz-series-1)" },
  { key: "offTopic", fill: "var(--viz-warning)" },
  { key: "refused", fill: "var(--viz-series-2)" },
  { key: "failed", fill: "var(--viz-critical)" },
] as const;

/**
 * The coach's cost on one screen: today's share of the all-owners limit, questions per day
 * by result, and the tokens the provider billed (with a price estimate when prices are set).
 */
export function CoachUsage({
  days,
  dailyLimit,
  prices,
  aiPacks,
}: {
  days: CoachUsageDay[];
  /** All owners together per day (COACH_ALL_DAILY_LIMIT). */
  dailyLimit: number;
  prices: { inputUsd: number; outputUsd: number } | null;
  /** Packs whose texts the AI rewrote (one call each, outside these tokens). */
  aiPacks: number;
}) {
  const copy = id.system;
  const today = days.at(-1);
  const used = today?.reserved ?? 0;
  const inputTokens = days.reduce((sum, d) => sum + d.inputTokens, 0);
  const outputTokens = days.reduce((sum, d) => sum + d.outputTokens, 0);
  const cost = prices
    ? (inputTokens / TOKENS_PER_PRICE_UNIT) * prices.inputUsd +
      (outputTokens / TOKENS_PER_PRICE_UNIT) * prices.outputUsd
    : null;
  const labels = copy.daily.series;
  const valueOf = (day: CoachUsageDay, key: (typeof SERIES)[number]["key"]) => day[key];

  const table = (
    <Table scrollLabel={copy.daily.chart}>
      <TableCaption>{copy.daily.chart}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{copy.daily.date}</TableHead>
          {SERIES.map((s) => (
            <TableHead key={s.key} className="text-right">
              {labels[s.key]}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {days.map((day) => (
          <TableRow key={day.date}>
            <TableCell className="tabular-nums">{formatDayMonth(day.date)}</TableCell>
            {SERIES.map((s) => (
              <TableCell key={s.key} className="text-right tabular-nums">
                {valueOf(day, s.key)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="grid gap-3 *:min-w-0 sm:gap-4 lg:grid-cols-[1fr_1.6fr]">
      <div className="grid gap-3 sm:gap-4">
        <BentoTile tone="deep" as="section" aria-labelledby="coach-hari-ini">
          <h2 id="coach-hari-ini" className="text-sm font-semibold text-accent-lime">
            {copy.today.title}
          </h2>
          <p className="mt-2 text-3xl font-bold">{copy.today.used(used, dailyLimit)}</p>
          <Progress
            value={percentOf(used, dailyLimit)}
            aria-label={copy.today.meter}
            className="mt-4 h-2 bg-white/20 *:data-[slot=progress-indicator]:bg-accent-lime"
          />
          <p className="mt-2 text-brand-deep-muted">
            {copy.today.left(Math.max(0, dailyLimit - used))}
          </p>
        </BentoTile>
        <BentoTile as="section" aria-labelledby="token-ai">
          <h2 id="token-ai" className="text-xl font-semibold">
            {copy.tokens.title}
          </h2>
          <p className="text-muted-foreground">{copy.tokens.body(days.length)}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            {[
              [copy.tokens.input, formatNumber(inputTokens)],
              [copy.tokens.output, formatNumber(outputTokens)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-muted p-3">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="text-xl font-bold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3">
            {cost === null ? (
              <span className="text-sm text-muted-foreground">{copy.tokens.noPrice}</span>
            ) : (
              <>
                <span className="text-muted-foreground">{copy.tokens.cost}: </span>
                <span className="font-semibold tabular-nums">
                  {copy.tokens.costValue(formatDecimal(cost))}
                </span>
              </>
            )}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{copy.tokens.packs(aiPacks)}</p>
        </BentoTile>
      </div>

      <ChartCard
        headingId="coach-per-hari"
        title={copy.daily.title}
        description={copy.daily.body(days.length)}
        table={table}
      >
        <ChartLegend
          items={SERIES.map((s) => ({ key: s.key, label: labels[s.key], fill: s.fill }))}
        />
        <div className="mt-4">
          <DailyColumns
            label={copy.daily.chart}
            days={days.map((day) => ({
              key: day.date,
              label: formatDayMonth(day.date),
              segments: SERIES.map((s) => ({
                key: s.key,
                label: labels[s.key],
                value: valueOf(day, s.key),
                fill: s.fill,
              })),
            }))}
          />
        </div>
      </ChartCard>
    </div>
  );
}
