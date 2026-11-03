"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { id } from "@/content/id";

export const PAGE_SIZES = [10, 25, 50] as const;

/** "1–10 dari 36 UMKM", rows per page, previous / next (44px targets). */
export function TablePagination({
  pageIndex,
  pageSize,
  total,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
  onPageSize,
}: {
  pageIndex: number;
  pageSize: number;
  total: number;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPageSize: (size: number) => void;
}) {
  const copy = id.researcher.table;
  const selectId = useId();
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(total, (pageIndex + 1) * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 sm:px-6">
      <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
        {copy.pageInfo(from, to, total)}
      </p>
      <div className="flex items-center gap-2">
        <label htmlFor={selectId} className="text-sm text-muted-foreground">
          {copy.perPage}
        </label>
        <select
          id={selectId}
          value={pageSize}
          onChange={(event) => onPageSize(Number(event.target.value))}
          className="h-11 rounded-lg border bg-background px-2 text-sm"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          disabled={!canPrevious}
          aria-label={copy.previous}
        >
          <ChevronLeftIcon aria-hidden />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={!canNext}
          aria-label={copy.next}
        >
          <ChevronRightIcon aria-hidden />
        </Button>
      </div>
    </div>
  );
}
