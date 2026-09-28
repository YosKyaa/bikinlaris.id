import { id } from "@/content/id";

/** Number with label. `null` renders "—": no display numbers without data. */
export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | null;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value ?? id.common.notAvailable}</p>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
