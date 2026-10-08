import { PencilIcon } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/molecules/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import type { Participant, ResearchEvent } from "@/lib/data/types";
import { getSop } from "@/lib/diagnosis/bank";
import { dayNumber, formatDate, formatDateTime } from "@/lib/format";

import { BusinessMap } from "./business-map";

/** Researcher view of one participant: profile, map, pack, passive event log. */
export function BusinessDetail({
  participant,
  events,
}: {
  participant: Participant;
  events: ResearchEvent[];
}) {
  const { business, pack } = participant;
  const copy = id.researcher.detail;
  const options = id.profile.options;
  const fields = id.profile.fields;
  const profile = [
    [copy.owner, business.ownerName],
    [copy.whatsapp, `+${business.whatsapp}`],
    [fields.product.label, business.product],
    [fields.location.label, options.location[business.location]],
    [fields.sector.label, options.sector[business.sector]],
    [fields.yearsRunning.label, options.yearsRunning[business.yearsRunning]],
    [fields.employees.label, options.employees[business.employees]],
    [fields.ownerRole.label, options.ownerRole[business.ownerRole]],
  ];
  const ready = pack?.status === "siap" ? pack : null;

  return (
    <div className="space-y-8">
      <section aria-labelledby="profil" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="profil" className="text-xl font-semibold">
            {copy.profile}
          </h2>
          <Button asChild variant="ghost">
            <Link href={ROUTES.editParticipant(business.id)}>
              <PencilIcon aria-hidden />
              {id.researcher.actions.edit}
            </Link>
          </Button>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {profile.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-muted p-3">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ready ? (
        <div className="grid gap-6 *:min-w-0 lg:grid-cols-2">
          <BusinessMap map={ready.map} hardest={ready.hardestSection} />
          <section
            aria-labelledby="isi-paket"
            className="space-y-3 rounded-xl border bg-background p-5 shadow-card sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="isi-paket" className="text-2xl font-semibold">
                {copy.pack}
              </h2>
              <Badge variant="outline">{copy.source[ready.source]}</Badge>
            </div>
            <p className="text-muted-foreground">
              {formatDate(ready.createdOn)} · {id.researcher.table.day} {dayNumber(ready.createdOn)}
            </p>
            <ol className="list-decimal space-y-1 pl-5">
              {ready.sops.map((sop) => (
                <li key={sop.sopId}>{getSop(sop.sopId).title}</li>
              ))}
            </ol>
          </section>
        </div>
      ) : (
        <EmptyState title={copy.pack} body={copy.noPack} />
      )}

      <section aria-labelledby="log" className="space-y-3">
        <h2 id="log" className="text-xl font-semibold">
          {copy.events}
        </h2>
        {events.length === 0 ? (
          <EmptyState title={copy.events} body={copy.noEvents} />
        ) : (
          <div className="rounded-xl border bg-background shadow-card">
            <Table scrollLabel={copy.eventsTable}>
              <TableHeader>
                <TableRow>
                  <TableHead>{copy.eventTime}</TableHead>
                  <TableHead>{copy.eventAction}</TableHead>
                  <TableHead>{copy.eventMeta}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {formatDateTime(event.createdAt)}
                    </TableCell>
                    <TableCell>{id.researcher.events[event.action]}</TableCell>
                    <TableCell className="font-mono text-sm break-all text-muted-foreground">
                      {event.meta ? JSON.stringify(event.meta) : id.common.notAvailable}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
