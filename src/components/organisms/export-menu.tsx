"use client";

import { ChevronRightIcon, DownloadIcon, FileSpreadsheetIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";

type ExportTable = Parameters<typeof ROUTES.researcherExport>[0];
const CSV_TABLES: ExportTable[] = ["ringkasan", "events"];

/**
 * "Unduh data" in the sidebar: one row that opens the downloads (Excel report first, then
 * the raw CSV files), so the sidebar fits short laptop screens without scrolling.
 */
export function ExportMenu({
  coachExport,
  className,
}: {
  coachExport: boolean;
  className?: string;
}) {
  const copy = id.researcher.sidebar;
  const csv: ExportTable[] = coachExport ? [...CSV_TABLES, "coach"] : CSV_TABLES;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={className}>
          <DownloadIcon aria-hidden className="size-5 shrink-0" />
          {copy.exports}
          <ChevronRightIcon aria-hidden className="ml-auto size-4 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" sideOffset={12} className="w-72">
        <DropdownMenuItem asChild className="min-h-12 items-start py-2">
          <a href={ROUTES.researcherExport("laporan")} download>
            <FileSpreadsheetIcon aria-hidden className="mt-0.5 text-primary" />
            <span>
              <span className="block font-semibold">{copy.exportLinks.laporan}</span>
              <span className="block text-sm text-muted-foreground">
                {id.researcher.export.excelHint}
              </span>
            </span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground">
          {id.researcher.export.csvLabel}
        </DropdownMenuLabel>
        {csv.map((table) => (
          <DropdownMenuItem key={table} asChild className="min-h-11">
            <a href={ROUTES.researcherExport(table)} download>
              <DownloadIcon aria-hidden />
              {copy.exportLinks[table]}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
