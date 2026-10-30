import {
  ChevronDownIcon,
  ClipboardCheckIcon,
  Clock3Icon,
  TargetIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SopId } from "@/content/diagnosis";
import { id } from "@/content/id";
import { sopAnchor } from "@/lib/anchors";
import type { PackProblem } from "@/lib/data/types";
import { getProblem, getSection, getSop, rules } from "@/lib/diagnosis/bank";

/** Fogg: one small, concrete step for this week (high ability, clear prompt). */
export function FirstStepCard({ sopId }: { sopId: SopId }) {
  const sop = getSop(sopId);
  const setupMinutes = sop.tasks.reduce(
    (sum, t) => sum + (t.kind === "siapkan" ? t.minutes : 0),
    0,
  );
  const copy = id.pack.firstStep;
  return (
    <section className="rounded-xl bg-brand-deep p-5 text-white shadow-float sm:p-6 print:hidden">
      <p className="text-sm font-semibold text-accent-lime">{copy.eyebrow}</p>
      <p className="mt-1 text-xl font-semibold text-balance">{copy.title(sop.title)}</p>
      <p className="mt-2 flex items-center gap-2 text-brand-deep-muted">
        <Clock3Icon aria-hidden className="size-4 shrink-0" />
        {setupMinutes > 0 ? copy.setup(setupMinutes) : copy.noSetup}
      </p>
      <Button
        asChild
        size="lg"
        className="mt-4 w-full bg-accent-lime text-brand-deep shadow-none hover:bg-accent-lime/90 hover:shadow-none sm:w-auto"
      >
        <a href={`#${sopAnchor(sopId)}`}>{copy.open}</a>
      </Button>
    </section>
  );
}

const TIPS: { key: keyof Omit<typeof id.pack.tips, "label">; icon: LucideIcon }[] = [
  { key: "oneAtATime", icon: TargetIcon },
  { key: "tickDaily", icon: ClipboardCheckIcon },
  { key: "share", icon: UsersIcon },
];

/** How to use the pack, as three icons with two or three words each. */
export function PackTips() {
  return (
    <ul aria-label={id.pack.tips.label} className="grid grid-cols-3 gap-2 print:hidden">
      {TIPS.map(({ key, icon: Icon }) => (
        <li
          key={key}
          className="flex flex-col items-center gap-2 rounded-xl bg-muted px-2 py-3 text-center text-sm font-medium"
        >
          <Icon aria-hidden className="size-6 text-primary" />
          {id.pack.tips[key]}
        </li>
      ))}
    </ul>
  );
}

export function LaterSops({ sopIds }: { sopIds: SopId[] }) {
  if (sopIds.length === 0) return null;
  return (
    <section className="rounded-xl bg-muted p-5 print:hidden">
      <h2 className="text-lg font-semibold">{id.pack.later.title}</h2>
      <p className="text-sm text-muted-foreground">{id.pack.later.body}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {sopIds.map((sopId) => (
          <li key={sopId}>
            <Badge variant="outline" className="h-auto bg-background py-1">
              {getSop(sopId).title}
            </Badge>
          </li>
        ))}
      </ul>
    </section>
  );
}

const MANY_POINTS = rules.redPoints + rules.yellowPoints;

/** What the check found, folded away: available when wanted, not in the way (construct M1). */
export function ProblemList({ problems }: { problems: PackProblem[] }) {
  if (problems.length === 0) return null;
  return (
    <details className="group rounded-xl border bg-background shadow-card print:hidden">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-semibold [&::-webkit-details-marker]:hidden">
        {id.pack.problems.toggle(problems.length)}
        <ChevronDownIcon
          aria-hidden
          className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <ul className="divide-y border-t px-5">
        {problems.map((item) => {
          const problem = getProblem(item.id);
          return (
            <li key={item.id} className="flex items-start gap-3 py-3">
              <Badge
                variant={item.score >= MANY_POINTS ? "danger" : "warning"}
                className="mt-0.5 w-20 shrink-0"
              >
                {getSection(item.sectionId).label.split(" ")[0]}
              </Badge>
              <div className="min-w-0">
                <p className="font-semibold">{problem.title}</p>
                <p className="text-sm text-muted-foreground">{problem.impact}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

/**
 * Where the owner is in the 30 days. Information only: nothing to fill in, no streaks or
 * reminders (docs/keputusan.md). The participant code is for the day-30 questionnaire.
 */
export function PackStatusCard({
  day,
  totalDays,
  followUpDate,
  code,
}: {
  day: number;
  totalDays: number;
  followUpDate: string;
  code: string;
}) {
  const shownDay = Math.min(day, totalDays);
  const copy = id.pack.status;
  return (
    <section className="space-y-2 rounded-xl border bg-background p-4 shadow-card print:hidden">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-semibold tabular-nums">{copy.day(shownDay, totalDays)}</p>
        <p className="text-sm font-semibold text-muted-foreground tabular-nums">
          {copy.code(code)}
        </p>
      </div>
      <Progress
        value={(shownDay / totalDays) * 100}
        aria-label={copy.progressLabel(shownDay, totalDays)}
        className="h-2"
      />
      <p className="text-sm text-muted-foreground">
        {day > totalDays ? copy.after : copy.before(followUpDate)}
      </p>
    </section>
  );
}
