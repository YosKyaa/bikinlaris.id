import Link from "next/link";

import { EmptyState } from "@/components/molecules/empty-state";
import type { TableParticipant } from "@/components/molecules/participant-cells";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { STAGE_ORDER, type ParticipantFilter } from "@/lib/data/research";
import type { ParticipantRow } from "@/lib/data/types";
import { formatDateShort } from "@/lib/format";
import { regencyName } from "@/lib/wilayah";

import { ParticipantDataTable } from "./participant-data-table";

/**
 * All participants, most urgent first, as a data table (search, sort, pages). Labels are
 * resolved here on the server; the place list never reaches the browser. Actions live on the
 * detail page.
 */
export function ParticipantTable({
  rows,
  filter,
  compact = false,
  canDelete = false,
}: {
  rows: ParticipantRow[];
  filter: ParticipantFilter;
  /** Dashboard preview: no search and no pages. */
  compact?: boolean;
  /** Admins get a delete button per row. */
  canDelete?: boolean;
}) {
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
              <Link href={ROUTES.participants}>{id.researcher.empty.showAll}</Link>
            )}
          </Button>
        }
      />
    );
  }

  const tableRows: TableParticipant[] = rows.map((row) => ({
    businessId: row.businessId,
    code: row.code,
    businessName: row.businessName,
    ownerName: row.ownerName,
    place: regencyName(row.location),
    packCreatedOn: row.packCreatedOn,
    packLabel: row.packCreatedOn ? formatDateShort(row.packCreatedOn) : id.common.notAvailable,
    dayNumber: row.dayNumber,
    stage: row.stage,
    stageRank: STAGE_ORDER[row.stage],
  }));
  return <ParticipantDataTable rows={tableRows} compact={compact} canDelete={canDelete} />;
}
