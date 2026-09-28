import { CalendarClockIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { SopId } from "@/content/diagnosis";
import { id } from "@/content/id";
import type { PackProblem } from "@/lib/data/types";
import { getProblem, getSection, getSop, rules } from "@/lib/diagnosis/bank";

/** Fogg: one small, concrete step for this week (high ability, clear prompt). */
export function FirstStepCard({ sopId }: { sopId: SopId }) {
  const sop = getSop(sopId);
  const setupMinutes = sop.tasks.reduce(
    (sum, t) => sum + (t.kind === "siapkan" ? t.minutes : 0),
    0,
  );
  return (
    <section className="rounded-xl bg-brand-deep p-5 text-white shadow-float sm:p-6 print:hidden">
      <p className="text-sm font-semibold text-accent-lime">{id.pack.firstStep.eyebrow}</p>
      <p className="mt-2 text-lg font-medium">
        {setupMinutes > 0
          ? id.pack.firstStep.withSetup(sop.title, setupMinutes)
          : id.pack.firstStep.withoutSetup(sop.title)}
      </p>
    </section>
  );
}

export function PackGuide() {
  return (
    <section aria-labelledby="cara-pakai" className="print:hidden">
      <h2 id="cara-pakai" className="text-lg font-semibold">
        {id.pack.guide.title}
      </h2>
      <ol className="mt-3 space-y-2">
        {id.pack.guide.items.map((item, index) => (
          <li key={item} className="flex gap-3">
            <span className="font-semibold text-primary tabular-nums">{index + 1}.</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function LaterSops({ sopIds }: { sopIds: SopId[] }) {
  if (sopIds.length === 0) return null;
  return (
    <section className="rounded-xl bg-muted p-5 print:hidden">
      <h2 className="text-lg font-semibold">{id.pack.later.title}</h2>
      <p className="text-muted-foreground">{id.pack.later.body(sopIds.length)}</p>
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

export function ProblemList({ problems }: { problems: PackProblem[] }) {
  if (problems.length === 0) return null;
  return (
    <section
      aria-labelledby="masalah"
      className="rounded-xl border bg-background p-5 shadow-card sm:p-6"
    >
      <h2 id="masalah" className="text-lg font-semibold">
        {id.pack.problems.title}
      </h2>
      <p className="text-muted-foreground">{id.pack.problems.body}</p>
      <ul className="mt-4 divide-y">
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
                <p className="text-muted-foreground">{problem.impact}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function FollowUpNote({ day, date }: { day: number; date: string }) {
  return (
    <section className="flex gap-3 rounded-xl bg-muted p-5 text-muted-foreground print:hidden">
      <CalendarClockIcon aria-hidden className="mt-0.5 size-5 shrink-0" />
      <p>{id.pack.followUp(day, date)}</p>
    </section>
  );
}
