import { id } from "@/content/id";
import type { FunnelStep } from "@/lib/data/types";
import { percentOf, rampColor } from "@/lib/viz";

/**
 * Participants per stage as horizontal bars, relative to participants added. Stages are
 * ordered, so the bars step through one green ramp. The gap to the previous stage is printed:
 * a sharp drop shows where participants get stuck.
 */
export function ResearchFunnel({ steps }: { steps: FunnelStep[] }) {
  const copy = id.researcher.funnel;
  const base = steps[0]?.count ?? 0;

  return (
    <section
      aria-labelledby="perjalanan-peserta"
      className="min-w-0 rounded-xl border bg-background p-5 shadow-card sm:p-6 print:break-inside-avoid print:shadow-none"
    >
      <h2 id="perjalanan-peserta" className="text-xl font-semibold">
        {copy.title}
      </h2>
      <p className="mt-1 text-muted-foreground">{copy.body}</p>
      <ol className="mt-5 space-y-3">
        {steps.map((step, index) => {
          const percent = percentOf(step.count, base);
          const drop = index > 0 ? (steps[index - 1]?.count ?? 0) - step.count : 0;
          return (
            <li key={step.key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium">{copy.steps[step.key]}</span>
                <span className="text-lg font-semibold tabular-nums">{step.count}</span>
              </div>
              <div className="mt-1 h-3">
                {step.count > 0 ? (
                  <div
                    className="h-full rounded-r-[4px]"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: rampColor(index, steps.length),
                    }}
                  />
                ) : null}
              </div>
              <p className="mt-0.5 flex flex-wrap justify-between gap-x-3 text-sm text-muted-foreground tabular-nums">
                <span>{copy.share(percent)}</span>
                {drop > 0 ? <span>{id.monitoring.funnelDrop(drop)}</span> : null}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
