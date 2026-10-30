import { cn } from "@/lib/utils";

export interface BarSegment {
  key: string;
  label: string;
  value: number;
  /** CSS colour of the fill. */
  fill: string;
  /** Ink for the count printed inside the fill, picked for ≥ 4.5:1 contrast. */
  ink: "dark" | "light";
}

/** Below this share a segment is too narrow for its count; the legend and table carry it. */
const MIN_INLINE_SHARE = 0.12;

/**
 * One 100% stacked bar with its label. Segments are split by a 2px surface gap, and the
 * count sits inside a segment only when it fits.
 */
export function StackedBar({ label, segments }: { label: string; segments: BarSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const visible = segments.filter((s) => s.value > 0);
  const summary = visible.map((s) => `${s.label} ${s.value}`).join(", ");

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-muted-foreground tabular-nums">{total}</span>
      </div>
      <div role="img" aria-label={`${label}: ${summary}`} className="mt-1.5 flex h-6 gap-0.5">
        {visible.map((segment, index) => (
          <span
            key={segment.key}
            title={`${segment.label}: ${segment.value}`}
            className={cn(
              "flex min-w-1 items-center justify-center text-sm font-semibold tabular-nums",
              index === visible.length - 1 && "rounded-r-[4px]",
              segment.ink === "light" ? "text-white" : "text-foreground",
            )}
            style={{ flex: `${segment.value} 1 0`, backgroundColor: segment.fill }}
          >
            {segment.value / total >= MIN_INLINE_SHARE ? segment.value : null}
          </span>
        ))}
      </div>
    </div>
  );
}
