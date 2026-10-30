import { cn } from "@/lib/utils";

export interface LegendItem {
  key: string;
  label: string;
  fill: string;
}

/** Legend keys mirror the mark: a square for bars, a short stroke for lines. */
export function ChartLegend({
  items,
  shape = "rect",
}: {
  items: LegendItem[];
  shape?: "rect" | "line";
}) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item.key} className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className={cn(
              "shrink-0",
              shape === "line" ? "h-0.5 w-4 rounded-full" : "size-3 rounded-[3px]",
            )}
            style={{ backgroundColor: item.fill }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
