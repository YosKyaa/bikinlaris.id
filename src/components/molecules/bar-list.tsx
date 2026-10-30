import { id } from "@/content/id";
import { percentOf, rampColor } from "@/lib/viz";

export interface BarRow {
  key: string;
  label: string;
  value: number;
}

interface BarListProps {
  rows: BarRow[];
  /** Base for the percentage next to each value (e.g. all participants). */
  total: number;
  /** "single" for nominal categories, "ordinal" for ordered ones (size bands, day counts). */
  tone?: "single" | "ordinal";
}

/** Space kept right of the longest bar for its value. */
const VALUE_GUTTER = "6rem";

/**
 * Horizontal bars, label above, value at the bar tip. Thin bars grow from one baseline;
 * every value is printed, so the list doubles as its own table.
 */
export function BarList({ rows, total, tone = "single" }: BarListProps) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <ul className="space-y-3">
      {rows.map((row, index) => {
        const fill = tone === "ordinal" ? rampColor(index, rows.length) : "var(--viz-series-1)";
        return (
          <li key={row.key}>
            <span className="block">{row.label}</span>
            <div className="mt-1 flex items-center gap-2">
              {row.value > 0 ? (
                <span
                  aria-hidden
                  className="h-3 shrink-0 rounded-r-[4px]"
                  style={{
                    width: `calc((100% - ${VALUE_GUTTER}) * ${row.value / max})`,
                    backgroundColor: fill,
                  }}
                />
              ) : null}
              <span className="text-sm tabular-nums">
                <span className="font-semibold text-foreground">{row.value}</span>{" "}
                <span className="text-muted-foreground">
                  ({id.monitoring.percent(percentOf(row.value, total))})
                </span>
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
