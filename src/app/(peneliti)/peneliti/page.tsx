import { DownloadIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DueThisWeek } from "@/components/organisms/due-this-week";
import { FILTER_PARAM, ParticipantFilter } from "@/components/organisms/participant-filter";
import { ParticipantTable } from "@/components/organisms/participant-table";
import { ResearchFunnel } from "@/components/organisms/research-funnel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { data } from "@/lib/data";
import {
  buildDueList,
  buildFunnel,
  buildRows,
  countByFilter,
  DUE_WINDOW_DAYS,
  PARTICIPANT_FILTERS,
  type ParticipantFilter as Filter,
} from "@/lib/data/research";
import { isMockData } from "@/lib/env";
import { todayIso } from "@/lib/format";
import { questionnaireHref } from "@/lib/research-links";

export const metadata: Metadata = { title: id.researcher.title };

function parseFilter(value: string | string[] | undefined): Filter {
  return PARTICIPANT_FILTERS.find((f) => f === value) ?? "semua";
}

/** Three jobs: add a participant, send this week's questionnaires, download the data. */
export default async function ResearcherPage({ searchParams }: PageProps<"/peneliti">) {
  const filter = parseFilter((await searchParams)[FILTER_PARAM]);
  const today = todayIso();
  const participants = await data().staff.listParticipants();
  const rows = buildRows(participants, today);
  const due = buildDueList(participants, today).map((item) => ({
    ...item,
    sendHref: questionnaireHref(item),
  }));

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{id.researcher.title}</h1>
          <p className="text-muted-foreground">{id.researcher.subtitle}</p>
        </div>
        <Button asChild size="lg">
          <Link href={ROUTES.newParticipant}>
            <PlusIcon aria-hidden />
            {id.researcher.menu.newParticipant}
          </Link>
        </Button>
      </header>

      {isMockData ? (
        <Alert>
          <AlertDescription className="text-foreground">
            {id.researcher.mockBanner}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 *:min-w-0 lg:grid-cols-[1.4fr_1fr]">
        <DueThisWeek items={due} windowDays={DUE_WINDOW_DAYS} />
        <ResearchFunnel steps={buildFunnel(participants, today)} />
      </div>

      <section aria-labelledby="daftar-umkm" className="space-y-4">
        <div>
          <h2 id="daftar-umkm" className="text-2xl font-semibold">
            {id.researcher.table.title}
          </h2>
          <p className="text-muted-foreground">{id.researcher.table.body}</p>
        </div>
        <ParticipantFilter
          filters={PARTICIPANT_FILTERS}
          active={filter}
          counts={countByFilter(rows)}
        />
        <ParticipantTable
          rows={filter === "semua" ? rows : rows.filter((row) => row.stage === filter)}
          filter={filter}
        />
      </section>

      <section
        aria-labelledby="unduh-data"
        className="flex flex-col gap-4 rounded-xl bg-muted p-5 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h2 id="unduh-data" className="text-lg font-semibold">
            {id.researcher.export.title}
          </h2>
          <p className="text-muted-foreground">{id.researcher.export.body}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="bg-background">
            <a href={ROUTES.researcherExport("ringkasan")} download>
              <DownloadIcon aria-hidden />
              {id.researcher.export.summary}
            </a>
          </Button>
          <Button asChild variant="outline" className="bg-background">
            <a href={ROUTES.researcherExport("events")} download>
              <DownloadIcon aria-hidden />
              {id.researcher.export.events}
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
