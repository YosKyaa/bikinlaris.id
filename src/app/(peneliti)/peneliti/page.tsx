import { DownloadIcon } from "lucide-react";
import type { Metadata } from "next";

import { CreateAccountDialog } from "@/components/organisms/create-account-dialog";
import { FILTER_PARAM, FollowupFilter } from "@/components/organisms/followup-filter";
import { FollowupTable } from "@/components/organisms/followup-table";
import { ResearchSummary } from "@/components/organisms/research-summary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import {
  FOLLOWUP_FILTERS,
  getResearchSummary,
  listFollowups,
  type FollowupFilter as Filter,
} from "@/lib/data/research";
import { isMockData } from "@/lib/env";

export const metadata: Metadata = { title: id.researcher.title };

function parseFilter(value: string | string[] | undefined): Filter {
  return FOLLOWUP_FILTERS.find((f) => f === value) ?? "semua";
}

export default async function ResearcherPage({ searchParams }: PageProps<"/peneliti">) {
  const filter = parseFilter((await searchParams)[FILTER_PARAM]);
  const [summary, all] = await Promise.all([getResearchSummary(), listFollowups("semua")]);
  const rows = filter === "semua" ? all : all.filter((row) => row.status === filter);
  const counts = Object.fromEntries(
    FOLLOWUP_FILTERS.map((f) => [
      f,
      f === "semua" ? all.length : all.filter((r) => r.status === f).length,
    ]),
  ) as Record<Filter, number>;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{id.researcher.title}</h1>
          <p className="text-muted-foreground">{id.researcher.subtitle}</p>
        </div>
        <CreateAccountDialog />
      </header>

      {isMockData ? (
        <Alert>
          <AlertDescription className="text-foreground">
            {id.researcher.mockBanner}
          </AlertDescription>
        </Alert>
      ) : null}

      <ResearchSummary summary={summary} />

      <section aria-labelledby="tindak-lanjut" className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="tindak-lanjut" className="text-2xl font-semibold">
              {id.researcher.table.title}
            </h2>
            <p className="text-muted-foreground">{id.researcher.table.body}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href={ROUTES.researcherExport("ringkasan")} download>
                <DownloadIcon aria-hidden />
                {id.researcher.export.summary}
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={ROUTES.researcherExport("events")} download>
                <DownloadIcon aria-hidden />
                {id.researcher.export.events}
              </a>
            </Button>
          </div>
        </div>
        <FollowupFilter filters={FOLLOWUP_FILTERS} active={filter} counts={counts} />
        <FollowupTable rows={rows} filter={filter} />
      </section>
    </div>
  );
}
