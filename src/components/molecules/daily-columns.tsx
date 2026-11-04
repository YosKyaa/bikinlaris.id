import { cn } from "@/lib/utils";
import { niceScale } from "@/lib/viz";

export interface ColumnSegment {
  key: string;
  label: string;
  value: number;
  fill: string;
}

export interface DayColumn {
  key: string;
  /** Short date under the column, e.g. "4 Nov". */
  label: string;
  segments: ColumnSegment[];
}

/** Every n-th date is labelled so the axis stays readable at 360px. */
const LABEL_EVERY = 3;

/**
 * Stacked columns, one per day, on a shared baseline with a round axis maximum. Each column
 * names its numbers for screen readers; the exact table sits behind the card's toggle.
 */
export function DailyColumns({ days, label }: { days: DayColumn[]; label: string }) {
  const totals = days.map((day) => day.segments.reduce((sum, s) => sum + s.value, 0));
  const { max } = niceScale(Math.max(0, ...totals));
  return (
    <figure aria-label={label}>
      <div className="flex h-40 items-end gap-1 border-b border-viz-axis lg:h-56">
        {days.map((day, index) => {
          const total = totals[index];
          const summary = day.segments
            .filter((s) => s.value > 0)
            .map((s) => `${s.label} ${s.value}`)
            .join(", ");
          return (
            <div
              key={day.key}
              role="img"
              aria-label={`${day.label}: ${summary || "0"}`}
              className="flex h-full flex-1 flex-col justify-end"
            >
              <div
                className="flex flex-col-reverse gap-px overflow-hidden rounded-t-[3px]"
                style={{ height: `${(total / max) * 100}%` }}
              >
                {day.segments
                  .filter((s) => s.value > 0)
                  .map((segment) => (
                    <span
                      key={segment.key}
                      className="block min-h-px"
                      style={{ flex: `${segment.value} 1 0`, backgroundColor: segment.fill }}
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* Labels may be wider than their column: centred on it, anchored inside at the edges. */}
      <div aria-hidden className="mt-1 flex h-5 gap-1 text-sm text-muted-foreground tabular-nums">
        {days.map((day, index) => (
          <span key={day.key} className="relative flex-1">
            {(days.length - 1 - index) % LABEL_EVERY === 0 ? (
              <span
                className={cn(
                  "absolute top-0 whitespace-nowrap",
                  index === 0
                    ? "left-0"
                    : index === days.length - 1
                      ? "right-0"
                      : "left-1/2 -translate-x-1/2",
                )}
              >
                {day.label}
              </span>
            ) : null}
          </span>
        ))}
      </div>
    </figure>
  );
}
