"use client";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type FilterFn,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";

import { ParticipantCards, type TableParticipant } from "@/components/molecules/participant-cells";
import { ariaSort, SortHeader } from "@/components/molecules/sort-header";
import { PAGE_SIZES, TablePagination } from "@/components/molecules/table-pagination";
import { TableSearch } from "@/components/molecules/table-search";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import * as id from "@/content/id";
import { cn } from "@/lib/utils";

import type { MemberOption } from "./assignee-control";
import { BulkAssignBar } from "./bulk-assign-bar";
import { DeleteParticipantButton } from "./delete-participant-button";
import { EDGE, ParticipantTableDesktop } from "./participant-table-desktop";

const COLUMNS = [
  "businessName",
  "packCreatedOn",
  "dayNumber",
  "stageRank",
  "assigneeName",
  "lastContactAt",
] as const;
type ColumnKey = (typeof COLUMNS)[number];

const RIGHT_ALIGNED: ReadonlySet<ColumnKey> = new Set(["dayNumber"]);

const matches: FilterFn<TableParticipant> = (row, _column, query: string) => {
  const q = query.trim().toLowerCase();
  const p = row.original;
  return [p.businessName, p.code, p.ownerName, p.place, p.assigneeName].some((v) =>
    v.toLowerCase().includes(q),
  );
};

/**
 * Participants as a data table: search, sortable columns, pages. Starts in urgency order
 * (as given). Phones get one card per participant instead of a table that scrolls sideways.
 * Admins can tick participants and give them to a pendamping in one go.
 */
export function ParticipantDataTable({
  rows,
  compact = false,
  canDelete = false,
  assignMembers = null,
}: {
  rows: TableParticipant[];
  /** Dashboard preview: no search and no pages. */
  compact?: boolean;
  /** Admins get a delete button per row. */
  canDelete?: boolean;
  /** Admins: team members to assign selected participants to; null = no selection. */
  assignMembers?: MemberOption[] | null;
}) {
  const copy = id.researcher.table;
  const labels: Record<ColumnKey, string> = {
    businessName: copy.business,
    packCreatedOn: copy.packDate,
    dayNumber: copy.day,
    stageRank: copy.stage,
    assigneeName: copy.assignee,
    lastContactAt: copy.lastContact,
  };
  const [sorting, setSorting] = useState<SortingState>([]);
  const [query, setQuery] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: compact ? rows.length : PAGE_SIZES[0],
  });
  const selectable = assignMembers !== null && !compact;

  // TanStack Table returns functions that must not be memoized. This app does not run the
  // React Compiler (next.config.ts), so nothing memoizes them.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    // Empty values (no pack yet) as undefined, so they sort last in both directions.
    columns: COLUMNS.map((key) => ({
      id: key,
      accessorFn: (row: TableParticipant) => row[key] ?? undefined,
      sortUndefined: "last" as const,
    })),
    state: { sorting, globalFilter: query, pagination, rowSelection },
    enableRowSelection: selectable,
    onSortingChange: setSorting,
    onGlobalFilterChange: setQuery,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: matches,
    getRowId: (row) => row.businessId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  const pageRows = table.getRowModel().rows;
  const visible = pageRows.map((row) => row.original);
  const total = table.getFilteredRowModel().rows.length;
  const selectedIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);

  const deleteButton = (p: TableParticipant) => (
    <DeleteParticipantButton businessId={p.businessId} businessName={p.businessName} compact />
  );
  const selectBox = (p: TableParticipant) => (
    <Checkbox
      checked={rowSelection[p.businessId] === true}
      onCheckedChange={(checked) => table.getRow(p.businessId).toggleSelected(checked === true)}
      aria-label={id.assign.bulk.selectRow(p.businessName)}
      className="size-5"
    />
  );
  const selectPage = (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
      }
      onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked === true)}
      aria-label={id.assign.bulk.selectPage}
      className="size-5"
    />
  );

  const header = (key: ColumnKey, className?: string) => {
    const column = table.getColumn(key);
    const state = column?.getIsSorted() ?? false;
    const align = RIGHT_ALIGNED.has(key) ? "right" : "left";
    return (
      <th
        scope="col"
        aria-sort={ariaSort(state)}
        className={cn(
          "h-12 text-sm",
          EDGE,
          align === "right" ? "text-right" : "text-left",
          className,
        )}
      >
        <SortHeader
          label={labels[key]}
          state={state}
          onToggle={() => column?.toggleSorting(state === "asc")}
          sortLabel={copy.sortBy(labels[key])}
          align={align}
        />
      </th>
    );
  };

  return (
    <div className="rounded-2xl border bg-card">
      {compact ? null : (
        <TableSearch
          label={copy.search}
          placeholder={copy.searchPlaceholder}
          value={query}
          onChange={setQuery}
        />
      )}

      {total === 0 ? (
        <div className="space-y-3 px-5 py-10 text-center sm:px-6">
          <p className="text-muted-foreground">{copy.noMatch(query)}</p>
          <Button variant="outline" onClick={() => setQuery("")}>
            {copy.clearSearch}
          </Button>
        </div>
      ) : (
        // Clips row hover colours to the card's corners where the table touches them.
        <div className={cn("overflow-hidden", compact && "rounded-2xl")}>
          <ParticipantCards
            rows={visible}
            action={canDelete ? deleteButton : undefined}
            select={selectable ? selectBox : undefined}
          />
          <ParticipantTableDesktop
            rows={visible}
            header={header}
            select={selectable ? selectBox : undefined}
            selectAll={selectable ? selectPage : undefined}
            action={canDelete ? deleteButton : undefined}
          />
        </div>
      )}

      {compact || total === 0 ? null : (
        <TablePagination
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          total={total}
          canPrevious={table.getCanPreviousPage()}
          canNext={table.getCanNextPage()}
          onPrevious={() => table.previousPage()}
          onNext={() => table.nextPage()}
          onPageSize={(size) => table.setPageSize(size)}
        />
      )}
      {selectable && assignMembers ? (
        <BulkAssignBar
          selectedIds={selectedIds}
          members={assignMembers}
          onDone={() => setRowSelection({})}
        />
      ) : null}
    </div>
  );
}
