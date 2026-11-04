import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import type { ContactOutcome, ParticipantStage } from "@/lib/data/types";

import { ContactOutcomeBadge } from "./contact-outcome-badge";

export const STAGE_VARIANT: Record<
  ParticipantStage,
  "danger" | "warning" | "success" | "secondary" | "outline"
> = {
  siap_dikirim: "danger",
  terkirim: "warning",
  belum_h30: "secondary",
  cek_usaha: "outline",
  belum_mulai: "outline",
  selesai: "success",
};

/** One participant row, with labels already resolved on the server. */
export interface TableParticipant {
  businessId: string;
  code: string;
  businessName: string;
  ownerName: string;
  place: string;
  packCreatedOn: string | null;
  packLabel: string;
  dayNumber: number | null;
  stage: ParticipantStage;
  /** Urgency rank (0 = most urgent), for sorting by stage. */
  stageRank: number;
  /** Pendamping's name, or "Belum dibagi". */
  assigneeName: string;
  /** Newest contact note; null = not contacted yet. */
  lastContactOutcome: ContactOutcome | null;
  /** ISO time of that note (sorting), and its short date (display). */
  lastContactAt: string | null;
  lastContactLabel: string | null;
}

export function ParticipantLink({ participant: p }: { participant: TableParticipant }) {
  return (
    <Link
      href={ROUTES.researcherBusiness(p.businessId)}
      className="inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline"
      aria-label={id.researcher.table.detail(p.businessName)}
    >
      {p.businessName}
    </Link>
  );
}

export function ParticipantMeta({ participant: p }: { participant: TableParticipant }) {
  return (
    <span className="text-sm text-muted-foreground">
      <span className="font-mono">{p.code}</span> · {p.place} · {p.ownerName}
    </span>
  );
}

export function StageBadge({ stage }: { stage: ParticipantStage }) {
  return <Badge variant={STAGE_VARIANT[stage]}>{id.researcher.stage[stage]}</Badge>;
}

/** Newest contact as a badge with its date, or "Belum dihubungi". */
export function LastContact({ participant: p }: { participant: TableParticipant }) {
  if (!p.lastContactOutcome) {
    return <span className="text-sm text-muted-foreground">{id.contact.never}</span>;
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <ContactOutcomeBadge outcome={p.lastContactOutcome} />
      <span className="text-sm text-muted-foreground tabular-nums">{p.lastContactLabel}</span>
    </span>
  );
}

export const dayLabel = (p: TableParticipant) => p.dayNumber ?? id.common.notAvailable;

/** Phones: one card per participant, so nothing scrolls sideways. */
export function ParticipantCards({
  rows,
  action,
  select,
}: {
  rows: TableParticipant[];
  /** Row action (admin: delete), rendered at the end of the card. */
  action?: (participant: TableParticipant) => ReactNode;
  /** Selection box (admin: assign several at once), rendered before the name. */
  select?: (participant: TableParticipant) => ReactNode;
}) {
  const copy = id.researcher.table;
  return (
    <ul className="divide-y lg:hidden">
      {rows.map((p) => (
        <li key={p.businessId} className="flex gap-3 px-5 py-3">
          {select ? <div className="pt-3">{select(p)}</div> : null}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-start justify-between gap-3">
              <ParticipantLink participant={p} />
              <span className="shrink-0 pt-2.5">
                <StageBadge stage={p.stage} />
              </span>
            </div>
            <p>
              <ParticipantMeta participant={p} />
            </p>
            <p className="text-sm text-muted-foreground tabular-nums">
              {copy.packDate} {p.packLabel} · {copy.day} {dayLabel(p)}
            </p>
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">{copy.assignee}:</span> {p.assigneeName}
                </p>
                <LastContact participant={p} />
              </div>
              {action?.(p)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
