import { id } from "@/content/id";

/**
 * Number (or short text such as a date) with label. `null` renders "—": no display numbers
 * without data. Standalone figures use proportional digits (tabular only in columns).
 */
export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string | null;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-card print:shadow-none">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value ?? id.common.notAvailable}</p>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
