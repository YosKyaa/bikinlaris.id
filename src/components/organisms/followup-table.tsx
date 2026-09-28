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
import type { FollowupFilter } from "@/lib/data/research";
import type { FollowupRow, FollowupStatus } from "@/lib/data/types";
import { formatDateShort } from "@/lib/format";

import { MarkContactedButton } from "./mark-contacted-button";

const STATUS_VARIANT: Record<FollowupStatus, "danger" | "success" | "secondary"> = {
  siap_dihubungi: "danger",
  sudah_dihubungi: "success",
  belum_h30: "secondary",
};

export function FollowupTable({ rows, filter }: { rows: FollowupRow[]; filter: FollowupFilter }) {
  const copy = id.researcher.table;
  if (rows.length === 0) {
    return (
      <EmptyState
        title={id.researcher.empty.title}
        body={id.researcher.empty[filter]}
        action={
          filter === "semua" ? undefined : (
            <Button asChild variant="outline">
              <Link href={ROUTES.researcher}>{id.researcher.empty.showAll}</Link>
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableCaption className="sr-only">{copy.caption}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>{copy.business}</TableHead>
            <TableHead>{copy.contact}</TableHead>
            <TableHead>{copy.packDate}</TableHead>
            <TableHead className="text-right">{copy.day}</TableHead>
            <TableHead>{copy.status}</TableHead>
            <TableHead className="text-right">{copy.action}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.businessId}>
              <TableCell>
                <Link
                  href={ROUTES.researcherBusiness(row.businessId)}
                  className="font-semibold underline-offset-4 hover:underline"
                  aria-label={copy.detail(row.businessName)}
                >
                  {row.businessName}
                </Link>
                <div className="text-muted-foreground">
                  {id.profile.options.location[row.location]}
                </div>
              </TableCell>
              <TableCell>
                <a href={`mailto:${row.email}`} className="underline-offset-4 hover:underline">
                  {row.email}
                </a>
              </TableCell>
              <TableCell className="tabular-nums">{formatDateShort(row.packCreatedOn)}</TableCell>
              <TableCell className="text-right tabular-nums">{row.dayNumber}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[row.status]}>
                  {id.researcher.status[row.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {row.status === "sudah_dihubungi" ? null : (
                  <MarkContactedButton
                    businessId={row.businessId}
                    businessName={row.businessName}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
