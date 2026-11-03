import { DownloadIcon, FileSpreadsheetIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";

type ExportTable = Parameters<typeof ROUTES.researcherExport>[0];

/**
 * Downloads: the Excel report (dashboard with charts, tidy participant list) as the main
 * choice, the raw CSV files beside it for analysis tools. Outline buttons: "Tambah UMKM" stays
 * the page's one primary action.
 */
export function ExportPanel({ coachExport }: { coachExport: boolean }) {
  const copy = id.researcher.export;
  const files: { table: ExportTable; label: string }[] = [
    { table: "ringkasan", label: copy.summary },
    { table: "events", label: copy.events },
    ...(coachExport ? [{ table: "coach" as const, label: copy.coach }] : []),
  ];

  return (
    <section
      aria-labelledby="unduh-data"
      className="grid gap-5 rounded-2xl border bg-card p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center"
    >
      <div>
        <h2 id="unduh-data" className="text-lg font-semibold">
          {copy.title}
        </h2>
        <p className="text-muted-foreground">{copy.body}</p>
      </div>
      <div className="flex flex-col gap-3 lg:items-end">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-auto min-h-12 justify-start border-primary/40 bg-success-soft py-2 text-left hover:bg-success-soft/70"
        >
          <a href={ROUTES.researcherExport("laporan")} download>
            <FileSpreadsheetIcon aria-hidden className="size-5 text-success" />
            <span>
              <span className="block text-success">{copy.excel}</span>
              <span className="block text-sm font-normal text-muted-foreground">
                {copy.excelHint}
              </span>
            </span>
          </a>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{copy.csvLabel}</span>
          {files.map(({ table, label }) => (
            <Button key={table} asChild variant="ghost" size="sm" className="h-11">
              <a href={ROUTES.researcherExport(table)} download>
                <DownloadIcon aria-hidden />
                {label}
              </a>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
