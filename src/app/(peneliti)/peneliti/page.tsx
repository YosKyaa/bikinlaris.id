import { ArrowRightIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BentoGrid } from "@/components/atoms/bento-tile";
import { DashboardKpis } from "@/components/organisms/dashboard-kpis";
import { DueThisWeek } from "@/components/organisms/due-this-week";
import { ParticipantTable } from "@/components/organisms/participant-table";
import { ResearchFunnel } from "@/components/organisms/research-funnel";
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
} from "@/lib/data/research";
import { requireStaffPage } from "@/lib/data/staff-session";
import { formatDate, todayIso } from "@/lib/format";
import { questionnaireHref } from "@/lib/research-links";

export const metadata: Metadata = { title: id.researcher.dashboard.title };

/** How many of the most urgent participants the overview lists (the rest is on the list page). */
const URGENT_ROWS = 6;

/**
 * Overview: four headline numbers, this week's questionnaires beside the participant journey,
 * and the most urgent participants. Adding a participant is the one primary action.
 */
export default async function ResearcherDashboardPage() {
  const [user, participants] = await Promise.all([
    requireStaffPage(),
    data().staff.listParticipants(),
  ]);
  const copy = id.researcher.dashboard;
  const today = todayIso();
  const rows = buildRows(participants, today);
  const counts = countByFilter(rows);
  const funnel = buildFunnel(participants, today);
  const packs = funnel.find((step) => step.key === "packsCreated")?.count ?? 0;
  const due = buildDueList(participants, today).map((item) => ({
    ...item,
    sendHref: questionnaireHref(item),
  }));
  const urgent = rows.filter((row) => row.stage !== "selesai").slice(0, URGENT_ROWS);
  const firstName = (user.name ?? user.email).split(/[\s@]/)[0];

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary">{copy.asOf(formatDate(today))}</p>
          <h1 className="text-3xl font-bold tracking-tight">{copy.greeting(firstName)}</h1>
          <p className="text-muted-foreground">{copy.subtitle}</p>
        </div>
        <Button asChild size="lg">
          <Link href={ROUTES.newParticipant}>
            <PlusIcon aria-hidden />
            {id.researcher.menu.newParticipant}
          </Link>
        </Button>
      </header>

      <DashboardKpis
        total={counts.semua}
        notStarted={counts.belum_mulai}
        packs={packs}
        ready={counts.siap_dikirim}
        done={counts.selesai}
      />

      <BentoGrid className="lg:grid-cols-[1.4fr_1fr]">
        <DueThisWeek items={due} windowDays={DUE_WINDOW_DAYS} />
        <ResearchFunnel steps={funnel} />
      </BentoGrid>

      <section aria-labelledby="perlu-tindak" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="perlu-tindak" className="text-2xl font-semibold">
              {copy.urgent.title}
            </h2>
            <p className="text-muted-foreground">{copy.urgent.body}</p>
          </div>
          <Button asChild variant="outline">
            <Link href={ROUTES.participants}>
              {copy.urgent.seeAll(counts.semua)}
              <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
        </div>
        {/* Everyone done: nothing urgent, and the empty state would wrongly say "add the first". */}
        {urgent.length > 0 || counts.semua === 0 ? (
          <ParticipantTable rows={urgent} filter="semua" />
        ) : null}
      </section>
    </>
  );
}
