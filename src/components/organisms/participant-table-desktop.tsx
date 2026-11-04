"use client";

import type { ReactNode } from "react";

import {
  dayLabel,
  LastContact,
  ParticipantLink,
  ParticipantMeta,
  StageBadge,
  type TableParticipant,
} from "@/components/molecules/participant-cells";
import { id } from "@/content/id";
import { cn } from "@/lib/utils";

/** Cell padding matches the tile padding (20px, 24px from sm), so the table lines up. */
export const EDGE = "px-3 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6";
const CELL = cn("py-2 align-middle text-base", EDGE);
/** The pack date column only fits next to the sidebar on wide screens. */
const WIDE_ONLY = "hidden xl:table-cell";

/**
 * Laptop view of the participant list (phones get cards). Headers come from the data table
 * (they sort); the first and last columns are the optional selection box and delete button.
 */
export function ParticipantTableDesktop({
  rows,
  header,
  select,
  selectAll,
  action,
}: {
  rows: TableParticipant[];
  header: (
    key:
      | "businessName"
      | "packCreatedOn"
      | "dayNumber"
      | "stageRank"
      | "assigneeName"
      | "lastContactAt",
    className?: string,
  ) => ReactNode;
  select?: (participant: TableParticipant) => ReactNode;
  selectAll?: ReactNode;
  action?: (participant: TableParticipant) => ReactNode;
}) {
  const copy = id.researcher.table;
  return (
    <table className="hidden w-full caption-bottom lg:table">
      <caption className="sr-only">{copy.caption}</caption>
      <thead className="border-b bg-muted/60">
        <tr>
          {selectAll ? (
            <th scope="col" className={cn("w-12", EDGE)}>
              {selectAll}
            </th>
          ) : null}
          {header("businessName")}
          {header("packCreatedOn", WIDE_ONLY)}
          {header("dayNumber")}
          {header("stageRank")}
          {header("assigneeName")}
          {header("lastContactAt")}
          {action ? (
            <th scope="col" className={cn("w-14", EDGE)}>
              <span className="sr-only">{id.researcher.remove.actions}</span>
            </th>
          ) : null}
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((p) => (
          <tr key={p.businessId} className="transition-colors hover:bg-muted/40">
            {select ? <td className={CELL}>{select(p)}</td> : null}
            <td className={CELL}>
              <ParticipantLink participant={p} />
              <div>
                <ParticipantMeta participant={p} />
              </div>
            </td>
            <td className={cn(CELL, WIDE_ONLY, "tabular-nums")}>{p.packLabel}</td>
            <td className={cn(CELL, "text-right tabular-nums")}>{dayLabel(p)}</td>
            <td className={CELL}>
              <StageBadge stage={p.stage} />
            </td>
            <td className={CELL}>{p.assigneeName}</td>
            <td className={CELL}>
              <LastContact participant={p} />
            </td>
            {action ? <td className={cn(CELL, "text-right")}>{action(p)}</td> : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
