import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AssigneeFilter } from "@/components/organisms/assignee-filter";
import { ExportPanel } from "@/components/organisms/export-panel";
import { FILTER_PARAM, ParticipantFilter } from "@/components/organisms/participant-filter";
import { ParticipantTable } from "@/components/organisms/participant-table";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { isCoachEnabled } from "@/lib/ai";
import { ROUTES } from "@/lib/auth/constants";
import { data } from "@/lib/data";
import {
  ASSIGNEE_PARAM,
  buildRows,
  countByFilter,
  filterByAssignee,
  parseAssigneeFilter,
  PARTICIPANT_FILTERS,
  type ParticipantFilter as Filter,
} from "@/lib/data/research";
import { requireStaffPage } from "@/lib/data/staff-session";
import { todayIso } from "@/lib/format";

export const metadata: Metadata = { title: id.researcher.list.title };

function parseFilter(value: string | string[] | undefined): Filter {
  return PARTICIPANT_FILTERS.find((f) => f === value) ?? "semua";
}

/**
 * Every participant with the stage and pendamping filters (shareable links), then the
 * downloads. Admins tick participants to give them to a pendamping.
 */
export default async function ParticipantListPage({ searchParams }: PageProps<"/tim/umkm">) {
  const params = await searchParams;
  const filter = parseFilter(params[FILTER_PARAM]);
  const assignee = parseAssigneeFilter(params[ASSIGNEE_PARAM]);
  const staff = data().staff;
  const [user, participants, notes, team] = await Promise.all([
    requireStaffPage(),
    staff.listParticipants(),
    // The contact log may not exist yet on an older database (migration 20261104000000).
    staff.listContactNotes().catch(() => []),
    staff.listTeam(),
  ]);
  const members = team.members.map((m) => ({ id: m.id, name: m.name ?? m.email }));
  const rows = filterByAssignee(buildRows(participants, todayIso(), notes), assignee, user.id);
  const isAdmin = user.role === "admin";
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

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <ParticipantFilter
          filters={PARTICIPANT_FILTERS}
          active={filter}
          counts={countByFilter(rows)}
          keep={assignee ? { [ASSIGNEE_PARAM]: assignee } : {}}
        />
        <AssigneeFilter value={assignee} members={members} />
      </div>
      <ParticipantTable
        rows={filter === "semua" ? rows : rows.filter((row) => row.stage === filter)}
        filter={filter}
        members={members}
        canDelete={isAdmin}
        canAssign={isAdmin}
      />
      <ExportPanel coachExport={isCoachEnabled()} />
    </>
  );
}
