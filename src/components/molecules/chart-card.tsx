import type { ReactNode } from "react";

import { id } from "@/content/id";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  headingId: string;
  title: string;
  description?: string;
  children: ReactNode;
  /** Table twin of the chart (accessibility, exact values). Shown behind a toggle. */
  table?: ReactNode;
  className?: string;
}

/** Card around one chart: title, one-line reading guide, the chart, and its table view. */
export function ChartCard({
  headingId,
  title,
  description,
  children,
  table,
  className,
}: ChartCardProps) {
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "min-w-0 rounded-xl border bg-background p-5 shadow-card sm:p-6 print:break-inside-avoid print:shadow-none",
        className,
      )}
    >
      <h2 id={headingId} className="text-xl font-semibold">
        {title}
      </h2>
      {description ? <p className="mt-1 text-muted-foreground">{description}</p> : null}
      <div className="mt-5">{children}</div>
      {table ? (
        <details className="mt-5 border-t pt-2 print:hidden">
          <summary className="inline-flex min-h-11 cursor-pointer items-center rounded-lg font-medium text-primary">
            {id.monitoring.tableToggle}
          </summary>
          <div className="mt-2">{table}</div>
        </details>
      ) : null}
    </section>
  );
}
