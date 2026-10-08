import Link from "next/link";

import { EmptyState } from "@/components/molecules/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ROUTES } from "@/lib/auth/constants";
import type { ParticipantFilter } from "@/lib/data/research";
import type { ParticipantRow, ParticipantStage } from "@/lib/data/types";
import { formatDateShort } from "@/lib/format";

export const STAGE_VARIANT: Record<
  ParticipantStage,
  "danger" | "warning" | "success" | "secondary" | "outline"
> = {
  siap_dikirim: "danger",
  terkirim: "warning",
  belum_h30: "secondary",
  cek_usaha: "outline",
  belum_mulai: "outline",
  selesai: "success",
};

/** All participants, most urgent first. Actions live on the detail page. */
export function ParticipantTable({
  rows,
  filter,
}: {
  rows: ParticipantRow[];
  filter: ParticipantFilter;
}) {
  const copy = id.researcher.table;
  if (rows.length === 0) {
    return (
      <EmptyState
        title={id.researcher.empty.title}
        body={id.researcher.empty[filter]}
        action={
          <Button asChild variant="outline">
            {filter === "semua" ? (
              <Link href={ROUTES.newParticipant}>{id.researcher.menu.newParticipant}</Link>
            ) : (
              <Link href={ROUTES.researcher}>{id.researcher.empty.showAll}</Link>
            )}
          </Button>
        }
      />
    );
  }

  return (
    <div className="rounded-xl border bg-background shadow-card">
      <Table>
        <TableCaption className="sr-only">{copy.caption}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>{copy.business}</TableHead>
            <TableHead>{copy.owner}</TableHead>
            <TableHead>{copy.packDate}</TableHead>
            <TableHead className="text-right">{copy.day}</TableHead>
            <TableHead>{copy.stage}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.businessId}>
              <TableCell>
                <Link
                  href={ROUTES.researcherBusiness(row.businessId)}
                  className="inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline"
                  aria-label={copy.detail(row.businessName)}
                >
                  {row.businessName}
                </Link>
                <div className="text-sm text-muted-foreground">
                  <span className="font-mono">{row.code}</span> ·{" "}
                  {id.profile.options.location[row.location]}
                </div>
              </TableCell>
              <TableCell>{row.ownerName}</TableCell>
              <TableCell className="tabular-nums">
                {row.packCreatedOn ? formatDateShort(row.packCreatedOn) : id.common.notAvailable}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.dayNumber ?? id.common.notAvailable}
              </TableCell>
              <TableCell>
                <Badge variant={STAGE_VARIANT[row.stage]}>{id.researcher.stage[row.stage]}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
