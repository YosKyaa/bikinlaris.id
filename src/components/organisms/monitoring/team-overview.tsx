import { ChartCard } from "@/components/molecules/chart-card";
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
import type { TeamRow } from "@/lib/data/monitoring";

const COLUMNS = ["added", "packs", "done"] as const;

/** Participants per team member. Three measures per person, so a table rather than colours. */
export function TeamOverview({ rows }: { rows: TeamRow[] }) {
  const copy = id.monitoring.team;
  return (
    <ChartCard headingId="per-pendamping" title={copy.title} description={copy.body}>
      <Table scrollLabel={copy.caption}>
        <TableCaption className="sr-only">{copy.caption}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>{copy.member}</TableHead>
            {COLUMNS.map((column) => (
              <TableHead key={column} className="text-right">
                {copy[column]}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.staffId ?? "unknown"}>
              <TableCell className="font-medium break-words">{row.name ?? copy.unknown}</TableCell>
              {COLUMNS.map((column) => (
                <TableCell key={column} className="text-right tabular-nums">
                  {row[column]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ChartCard>
  );
}
