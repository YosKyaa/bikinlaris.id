import { DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";

type ExportTable = Parameters<typeof ROUTES.researcherExport>[0];

/** CSV downloads for analysis, joined to the questionnaire by participant code. */
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
      className="flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between"
    >
      <div>
        <h2 id="unduh-data" className="text-lg font-semibold">
          {copy.title}
        </h2>
        <p className="text-muted-foreground">{copy.body}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {files.map(({ table, label }) => (
          <Button key={table} asChild variant="outline">
            <a href={ROUTES.researcherExport(table)} download>
              <DownloadIcon aria-hidden />
              {label}
            </a>
          </Button>
        ))}
      </div>
    </section>
  );
}
