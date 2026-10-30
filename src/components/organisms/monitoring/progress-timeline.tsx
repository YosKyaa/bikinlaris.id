import { ChartCard } from "@/components/molecules/chart-card";
import { LineChart, type LineSeries } from "@/components/molecules/line-chart";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { id } from "@/content/id";
import type { Timeline } from "@/lib/data/monitoring";
import { formatDate, formatDateShort, formatDayMonth } from "@/lib/format";

/** Axis labels on the 1st of each month, plus the 15th where there is room. */
const MONTH_START = "01";
const MID_MONTH = "15";
const DAYS_PER_ROW = 7;

/** Series order = validated palette order (green, blue, orange). */
const SERIES: LineSeries[] = [
  { key: "packs", label: id.monitoring.timeline.series.packs, color: "var(--viz-series-1)" },
  { key: "day30", label: id.monitoring.timeline.series.day30, color: "var(--viz-series-2)" },
  { key: "done", label: id.monitoring.timeline.series.done, color: "var(--viz-series-3)" },
];

/** Cumulative packs, day-30 dates (known ahead) and questionnaires, with today and deadline. */
export function ProgressTimeline({ timeline }: { timeline: Timeline }) {
  const copy = id.monitoring.timeline;
  const { points } = timeline;
  const indexOf = (date: string) => points.findIndex((p) => p.date === date);
  const todayIndex = Math.max(0, indexOf(timeline.today));
  const deadlineIndex = indexOf(timeline.deadline);
  const weekly = points.filter((_, i) => i % DAYS_PER_ROW === 0 || i === points.length - 1);

  const table = (
    <Table scrollLabel={copy.caption}>
      <TableCaption>{copy.caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{copy.date}</TableHead>
          {SERIES.map((s) => (
            <TableHead key={s.key} className="text-right">
              {s.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {weekly.map((p) => (
          <TableRow key={p.date}>
            <TableCell>{formatDateShort(p.date)}</TableCell>
            {[p.packs, p.day30, p.done].map((value, i) => (
              <TableCell key={SERIES[i]?.key} className="text-right tabular-nums">
                {value ?? id.common.notAvailable}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <ChartCard headingId="garis-waktu" title={copy.title} description={copy.body} table={table}>
      <LineChart
        label={copy.chart}
        hint={copy.keys}
        series={SERIES}
        points={points.map((p) => ({
          label: formatDate(p.date),
          values: [p.packs, p.day30, p.done],
        }))}
        ticks={points.flatMap((p, index) => {
          const day = p.date.slice(-2);
          return day === MONTH_START || day === MID_MONTH
            ? [{ index, label: formatDayMonth(p.date), minor: day === MID_MONTH }]
            : [];
        })}
        markers={[
          { index: todayIndex, label: copy.today },
          ...(deadlineIndex >= 0 ? [{ index: deadlineIndex, label: copy.deadline }] : []),
        ]}
        futureFrom={todayIndex < points.length - 1 ? todayIndex + 1 : null}
        futureLabel={copy.future}
        initialIndex={todayIndex}
      />
    </ChartCard>
  );
}
