import { id } from "@/content/id";

/**
 * Values of every series at the chosen date. Works as the legend (line keys + names) and as
 * the tooltip; the value leads, the series name follows.
 */
export function LineReadout({
  date,
  series,
  values,
}: {
  date: string | undefined;
  series: { key: string; label: string; color: string }[];
  values: (number | null)[];
}) {
  return (
    <div aria-live="polite" className="min-h-14 space-y-1">
      <p className="text-sm font-semibold">{date}</p>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {series.map((s, i) => (
          <li key={s.key} className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="h-0.5 w-4 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="font-semibold tabular-nums">
              {values[i] ?? id.common.notAvailable}
            </span>
            <span className="text-muted-foreground">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
