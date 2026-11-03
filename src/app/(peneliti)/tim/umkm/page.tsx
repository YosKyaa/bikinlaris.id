import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ExportPanel } from "@/components/organisms/export-panel";
import { FILTER_PARAM, ParticipantFilter } from "@/components/organisms/participant-filter";
import { ParticipantTable } from "@/components/organisms/participant-table";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { isCoachEnabled } from "@/lib/ai";
import { ROUTES } from "@/lib/auth/constants";
import { data } from "@/lib/data";
import {
  buildRows,
  countByFilter,
  PARTICIPANT_FILTERS,
  type ParticipantFilter as Filter,
} from "@/lib/data/research";
import { requireStaffPage } from "@/lib/data/staff-session";
import { todayIso } from "@/lib/format";

export const metadata: Metadata = { title: id.researcher.list.title };

function parseFilter(value: string | string[] | undefined): Filter {
  return PARTICIPANT_FILTERS.find((f) => f === value) ?? "semua";
}

/** Every participant with the stage filter (shareable links), then the CSV downloads. */
export default async function ParticipantListPage({ searchParams }: PageProps<"/tim/umkm">) {
  const filter = parseFilter((await searchParams)[FILTER_PARAM]);
  const [user, participants] = await Promise.all([
    requireStaffPage(),
    data().staff.listParticipants(),
  ]);
  const rows = buildRows(participants, todayIso());
  const copy = id.researcher.list;

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
          <p className="text-muted-foreground">{copy.subtitle}</p>
        </div>
        <Button asChild size="lg">
          <Link href={ROUTES.newParticipant}>
            <PlusIcon aria-hidden />
            {id.researcher.menu.newParticipant}
          </Link>
        </Button>
      </header>

      <ParticipantFilter
        filters={PARTICIPANT_FILTERS}
        active={filter}
        counts={countByFilter(rows)}
      />
      <ParticipantTable
        rows={filter === "semua" ? rows : rows.filter((row) => row.stage === filter)}
        filter={filter}
        canDelete={user.role === "admin"}
      />
      <ExportPanel coachExport={isCoachEnabled()} />
    </>
  );
}
