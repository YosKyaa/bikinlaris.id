import { ChartCard } from "@/components/molecules/chart-card";
import { ChartLegend } from "@/components/molecules/chart-legend";
import { StackedBar, type BarSegment } from "@/components/molecules/stacked-bar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SECTION_COLORS, type SectionColor } from "@/content/diagnosis.types";
import { id } from "@/content/id";
import type { SectionHealthRow } from "@/lib/data/monitoring";
import { getSection } from "@/lib/diagnosis/bank";

/** Status fills (reserved meaning) with the label ink that clears 4.5:1 on each. */
const FILL: Record<SectionColor, Pick<BarSegment, "fill" | "ink">> = {
  hijau: { fill: "var(--viz-good)", ink: "dark" },
  kuning: { fill: "var(--viz-warning)", ink: "dark" },
  merah: { fill: "var(--viz-critical)", ink: "light" },
};

/** Per section: how many packs came out green, yellow, red. Words in the legend, not colour alone. */
export function SectionHealth({ rows, packs }: { rows: SectionHealthRow[]; packs: number }) {
  const copy = id.monitoring.health;
  const table = (
    <Table scrollLabel={copy.caption}>
      <TableCaption>{copy.caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{copy.section}</TableHead>
          {SECTION_COLORS.map((color) => (
            <TableHead key={color} className="text-right">
              {id.sectionStatus[color]}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.sectionId}>
            <TableCell>{getSection(row.sectionId).label}</TableCell>
            {SECTION_COLORS.map((color) => (
              <TableCell key={color} className="text-right tabular-nums">
                {row[color]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <ChartCard
      headingId="kondisi-bagian"
      title={copy.title}
      description={copy.body(packs)}
      table={table}
    >
      <ChartLegend
        items={SECTION_COLORS.map((color) => ({
          key: color,
          label: id.sectionStatus[color],
          fill: FILL[color].fill,
        }))}
      />
      <div className="mt-4 space-y-4">
        {rows.map((row) => (
          <StackedBar
            key={row.sectionId}
            label={getSection(row.sectionId).label}
            segments={SECTION_COLORS.map((color) => ({
              key: color,
              label: id.sectionStatus[color],
              value: row[color],
              ...FILL[color],
            }))}
          />
        ))}
      </div>
    </ChartCard>
  );
}
