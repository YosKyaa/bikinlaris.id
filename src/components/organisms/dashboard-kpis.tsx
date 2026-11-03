import {
  ArrowRightIcon,
  CircleCheckBigIcon,
  FileCheck2Icon,
  SendIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BentoGrid, BentoTile, type TileTone } from "@/components/atoms/bento-tile";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { percentOf } from "@/lib/viz";
import { cn } from "@/lib/utils";

import { FILTER_PARAM } from "./participant-filter";

interface Kpi {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: TileTone;
  note: ReactNode;
}

const ICON_TONE: Record<TileTone, string> = {
  card: "bg-success-soft text-success",
  mint: "bg-background text-success",
  deep: "bg-accent-lime text-brand-deep",
  lime: "bg-brand-deep text-accent-lime",
};

const NOTE_TONE: Record<TileTone, string> = {
  card: "text-muted-foreground",
  mint: "text-muted-foreground",
  deep: "text-brand-deep-muted",
  lime: "text-brand-deep",
};

/**
 * The four numbers the team checks first, as bento tiles. The --brand-deep tile is the one
 * that asks for action (questionnaires due) and links to that filtered list.
 */
export function DashboardKpis({
  total,
  notStarted,
  packs,
  ready,
  done,
}: {
  total: number;
  notStarted: number;
  packs: number;
  ready: number;
  done: number;
}) {
  const copy = id.researcher.dashboard.kpis;
  const kpis: Kpi[] = [
    {
      label: copy.ready,
      value: ready,
      icon: SendIcon,
      tone: "deep",
      note:
        ready > 0 ? (
          <Link
            href={`${ROUTES.participants}?${FILTER_PARAM}=siap_dikirim`}
            className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-accent-lime underline-offset-4 hover:underline"
          >
            {copy.readyCta}
            <ArrowRightIcon aria-hidden className="size-4" />
          </Link>
        ) : (
          copy.readyNone
        ),
    },
    {
      label: copy.total,
      value: total,
      icon: UsersIcon,
      tone: "card",
      note: copy.notStarted(notStarted),
    },
    {
      label: copy.packs,
      value: packs,
      icon: FileCheck2Icon,
      tone: "card",
      note: copy.share(percentOf(packs, total)),
    },
    {
      label: copy.done,
      value: done,
      icon: CircleCheckBigIcon,
      tone: "lime",
      note: copy.ofPacks(percentOf(done, packs)),
    },
  ];

  return (
    <section aria-label={copy.label}>
      <BentoGrid className="grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, tone, note }) => (
          <BentoTile key={label} tone={tone} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-balance">{label}</p>
              <span
                aria-hidden
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-lg",
                  ICON_TONE[tone],
                )}
              >
                <Icon className="size-4" />
              </span>
            </div>
            <p className="text-4xl font-bold sm:text-5xl">{value}</p>
            {note ? <div className={cn("mt-auto text-sm", NOTE_TONE[tone])}>{note}</div> : null}
          </BentoTile>
        ))}
      </BentoGrid>
    </section>
  );
}
