"use client";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type FilterFn,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";

import {
  dayLabel,
  ParticipantCards,
  ParticipantLink,
  ParticipantMeta,
  StageBadge,
  type TableParticipant,
} from "@/components/molecules/participant-cells";
import { ariaSort, SortHeader } from "@/components/molecules/sort-header";
import { PAGE_SIZES, TablePagination } from "@/components/molecules/table-pagination";
import { TableSearch } from "@/components/molecules/table-search";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { cn } from "@/lib/utils";

import { DeleteParticipantButton } from "./delete-participant-button";

const COLUMNS = ["businessName", "ownerName", "packCreatedOn", "dayNumber", "stageRank"] as const;
type ColumnKey = (typeof COLUMNS)[number];

/** Cell padding matches the tile padding (20px, 24px from sm), so the table lines up. */
const EDGE = "px-3 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6";
const CELL = cn("py-2 align-middle text-base", EDGE);

const matches: FilterFn<TableParticipant> = (row, _column, query: string) => {
  const q = query.trim().toLowerCase();
  const p = row.original;
  return [p.businessName, p.code, p.ownerName, p.place].some((v) => v.toLowerCase().includes(q));
};

/**
 * Participants as a data table: search, sortable columns, pages. Starts in urgency order
 * (as given). Phones get one card per participant instead of a table that scrolls sideways.
 */
export function ParticipantDataTable({
  rows,
  compact = false,
  canDelete = false,
}: {
  rows: TableParticipant[];
  /** Dashboard preview: no search and no pages. */
  compact?: boolean;
  /** Admins get a delete button per row. */
  canDelete?: boolean;
}) {
  const copy = id.researcher.table;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [query, setQuery] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: compact ? rows.length : PAGE_SIZES[0],
  });

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
    state: { sorting, globalFilter: query, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setQuery,
    onPaginationChange: setPagination,
    globalFilterFn: matches,
    getRowId: (row) => row.businessId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  const visible = table.getRowModel().rows.map((row) => row.original);
  const deleteButton = (p: TableParticipant) => (
    <DeleteParticipantButton businessId={p.businessId} businessName={p.businessName} compact />
  );
  const total = table.getFilteredRowModel().rows.length;

  const header = (key: ColumnKey, label: string, align: "left" | "right" = "left") => {
    const column = table.getColumn(key);
    const state = column?.getIsSorted() ?? false;
    return (
      <th
        scope="col"
        aria-sort={ariaSort(state)}
        className={cn("h-12 text-sm", EDGE, align === "right" ? "text-right" : "text-left")}
      >
        <SortHeader
          label={label}
          state={state}
          onToggle={() => column?.toggleSorting(state === "asc")}
          sortLabel={copy.sortBy(label)}
          align={align}
        />
      </th>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
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
        <>
          <ParticipantCards rows={visible} action={canDelete ? deleteButton : undefined} />
          <table className="hidden w-full caption-bottom md:table">
            <caption className="sr-only">{copy.caption}</caption>
            <thead className="border-b bg-muted/60">
              <tr>
                {header("businessName", copy.business)}
                {header("ownerName", copy.owner)}
                {header("packCreatedOn", copy.packDate)}
                {header("dayNumber", copy.day, "right")}
                {header("stageRank", copy.stage)}
                {canDelete ? (
                  <th scope="col" className={cn("w-14", EDGE)}>
                    <span className="sr-only">{id.researcher.remove.actions}</span>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((p) => (
                <tr key={p.businessId} className="transition-colors hover:bg-muted/40">
                  <td className={CELL}>
                    <ParticipantLink participant={p} />
                    <div>
                      <ParticipantMeta participant={p} />
                    </div>
                  </td>
                  <td className={CELL}>{p.ownerName}</td>
                  <td className={cn(CELL, "tabular-nums")}>{p.packLabel}</td>
                  <td className={cn(CELL, "text-right tabular-nums")}>{dayLabel(p)}</td>
                  <td className={CELL}>
                    <StageBadge stage={p.stage} />
                  </td>
                  {canDelete ? <td className={cn(CELL, "text-right")}>{deleteButton(p)}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </>
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
    </div>
  );
}
