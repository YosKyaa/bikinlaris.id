import { niceScale } from "@/lib/viz";

import { ChartLegend } from "./chart-legend";

interface SampleMeterProps {
  label: string;
  done: number;
  reachable: number;
  thresholds: readonly { n: number }[];
  doneLabel: string;
  reachableLabel: string;
}

const PERCENT = 100;
/** Threshold labels past this point anchor right so they stay inside the card. */
const RIGHT_EDGE = 85;
const DONE_FILL = "var(--viz-ramp-6)";
const REACHABLE_FILL = "var(--viz-ramp-2)";

/**
 * Bullet meter: questionnaires filled in (dark), the most that can still be filled in before
 * the deadline (light), on a same-hue track, with the minimum-sample thresholds as ticks.
 */
export function SampleMeter({
  label,
  done,
  reachable,
  thresholds,
  doneLabel,
  reachableLabel,
}: SampleMeterProps) {
  const highest = thresholds.at(-1)?.n ?? 0;
  const { max } = niceScale(Math.max(highest, reachable, done));
  const at = (value: number) => Math.min(PERCENT, (value / max) * PERCENT);

  return (
    <div className="space-y-3">
      <div className="relative h-5 text-sm font-semibold tabular-nums" aria-hidden>
        {thresholds.map((t) => (
          <span
            key={t.n}
            className="absolute bottom-0"
            style={{
              left: `${at(t.n)}%`,
              transform: at(t.n) > RIGHT_EDGE ? "translateX(-100%)" : "translateX(-50%)",
            }}
          >
            {t.n}
          </span>
        ))}
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={done}
        aria-valuetext={`${doneLabel} ${done}. ${reachableLabel} ${reachable}.`}
        className="relative h-6 rounded-[4px] bg-viz-track"
      >
        <span
          className="absolute inset-y-0 left-0 rounded-r-[4px]"
          style={{ width: `${at(reachable)}%`, backgroundColor: REACHABLE_FILL }}
        />
        <span
          className="absolute inset-y-0 left-0 rounded-r-[4px]"
          style={{ width: `${at(done)}%`, backgroundColor: DONE_FILL }}
        />
        {thresholds.map((t) => (
          <span
            key={t.n}
            className="absolute -inset-y-1 w-0.5 -translate-x-1/2 bg-foreground"
            style={{ left: `${at(t.n)}%` }}
          />
        ))}
      </div>
      <ChartLegend
        items={[
          { key: "done", label: `${doneLabel}: ${done}`, fill: DONE_FILL },
          { key: "reachable", label: `${reachableLabel}: ${reachable}`, fill: REACHABLE_FILL },
        ]}
      />
    </div>
  );
}
