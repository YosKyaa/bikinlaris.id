import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import type { ParticipantStage } from "@/lib/data/types";

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
      <span className="font-mono">{p.code}</span> · {p.place}
    </span>
  );
}

export function StageBadge({ stage }: { stage: ParticipantStage }) {
  return <Badge variant={STAGE_VARIANT[stage]}>{id.researcher.stage[stage]}</Badge>;
}

export const dayLabel = (p: TableParticipant) => p.dayNumber ?? id.common.notAvailable;

/** Phones: one card per participant, so nothing scrolls sideways. */
export function ParticipantCards({
  rows,
  action,
}: {
  rows: TableParticipant[];
  /** Row action (admin: delete), rendered at the end of the card. */
  action?: (participant: TableParticipant) => ReactNode;
}) {
  const copy = id.researcher.table;
  return (
    <ul className="divide-y md:hidden">
      {rows.map((p) => (
        <li key={p.businessId} className="space-y-1 px-5 py-3">
          <div className="flex items-start justify-between gap-3">
            <ParticipantLink participant={p} />
            <span className="shrink-0 pt-2.5">
              <StageBadge stage={p.stage} />
            </span>
          </div>
          <p>
            <ParticipantMeta participant={p} />
          </p>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground tabular-nums">
              {p.ownerName} · {copy.packDate} {p.packLabel} · {copy.day} {dayLabel(p)}
            </p>
            {action?.(p)}
          </div>
        </li>
      ))}
    </ul>
  );
}
