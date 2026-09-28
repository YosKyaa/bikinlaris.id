import { id } from "@/content/id";
import type { FunnelStep } from "@/lib/data/types";

const PERCENT = 100;

/**
 * Participants per stage as horizontal bars, relative to accounts created.
 * A sharp drop between two rows shows where participants get stuck.
 */
export function ResearchFunnel({ steps }: { steps: FunnelStep[] }) {
  const copy = id.researcher.funnel;
  const base = steps[0]?.count ?? 0;

  return (
    <section
      aria-labelledby="corong-peserta"
      className="rounded-xl border bg-background p-5 shadow-card sm:p-6"
    >
      <h2 id="corong-peserta" className="text-xl font-semibold">
        {copy.title}
      </h2>
      <p className="mt-1 text-muted-foreground">{copy.body}</p>
      <ol className="mt-5 space-y-3">
        {steps.map((step) => {
          const percent =
            step.count !== null && base > 0 ? Math.round((step.count / base) * PERCENT) : null;
          return (
            <li key={step.key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium">{copy.steps[step.key]}</span>
                <span className="text-lg font-semibold tabular-nums">
                  {step.count ?? id.common.notAvailable}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${percent ?? 0}%` }}
                />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
                {percent === null ? copy.questionnairesNote : copy.share(percent)}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
