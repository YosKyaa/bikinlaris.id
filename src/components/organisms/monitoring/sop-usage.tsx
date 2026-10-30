import { ChartCard } from "@/components/molecules/chart-card";
import { ChartLegend } from "@/components/molecules/chart-legend";
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
import type { SopUsageRow } from "@/lib/data/monitoring";
import { getSop } from "@/lib/diagnosis/bank";

const OPENED_FILL = "var(--viz-series-1)";
/** Unopened part: a lighter step of the same hue (meter track). */
const UNOPENED_FILL = "var(--viz-ramp-1)";
const VALUE_GUTTER = "7.5rem";

/**
 * Per SOP, a meter: bar length = packs that contain it, dark part = owners who opened it.
 * Shows which SOPs are handed out and whether they are read (constructs X and M2).
 */
export function SopUsage({ rows }: { rows: SopUsageRow[] }) {
  const copy = id.monitoring.sops;
  const max = Math.max(1, ...rows.map((r) => r.assigned));
  const table = (
    <Table scrollLabel={copy.caption}>
      <TableCaption>{copy.caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{copy.sop}</TableHead>
          <TableHead className="text-right">{copy.assigned}</TableHead>
          <TableHead className="text-right">{copy.opened}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.sopId}>
            <TableCell>{getSop(row.sopId).title}</TableCell>
            <TableCell className="text-right tabular-nums">{row.assigned}</TableCell>
            <TableCell className="text-right tabular-nums">{row.opened}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <ChartCard headingId="pakai-sop" title={copy.title} description={copy.body} table={table}>
      <ChartLegend
        items={[
          { key: "opened", label: copy.opened, fill: OPENED_FILL },
          { key: "unopened", label: copy.notOpened, fill: UNOPENED_FILL },
        ]}
      />
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.sopId}>
            <span className="block">{getSop(row.sopId).title}</span>
            <div className="mt-1 flex items-center gap-2">
              {row.assigned > 0 ? (
                <span
                  aria-hidden
                  className="flex h-3 shrink-0 gap-0.5"
                  style={{ width: `calc((100% - ${VALUE_GUTTER}) * ${row.assigned / max})` }}
                >
                  {row.opened > 0 ? (
                    <span
                      className={row.opened === row.assigned ? "rounded-r-[4px]" : undefined}
                      style={{ flex: `${row.opened} 1 0`, backgroundColor: OPENED_FILL }}
                    />
                  ) : null}
                  {row.assigned > row.opened ? (
                    <span
                      className="rounded-r-[4px]"
                      style={{
                        flex: `${row.assigned - row.opened} 1 0`,
                        backgroundColor: UNOPENED_FILL,
                      }}
                    />
                  ) : null}
                </span>
              ) : null}
              <span className="text-sm text-muted-foreground tabular-nums">
                {copy.row(row.opened, row.assigned)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
