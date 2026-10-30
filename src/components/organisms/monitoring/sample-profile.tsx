import { BarList } from "@/components/molecules/bar-list";
import { ChartCard } from "@/components/molecules/chart-card";
import { id } from "@/content/id";
import type { CountRow, SampleProfile as Profile } from "@/lib/data/monitoring";

type Field = keyof Profile;

/** Ordered answer scales get the ordinal ramp; locations and sectors are nominal. */
const FIELDS: { field: Field; tone: "single" | "ordinal" }[] = [
  { field: "location", tone: "single" },
  { field: "sector", tone: "single" },
  { field: "yearsRunning", tone: "ordinal" },
  { field: "employees", tone: "ordinal" },
];

/**
 * Ordered scales keep every step (a zero is information). Long nominal lists (14 locations,
 * 14 sectors) show only the filled options, largest first; the CSV keeps every code.
 */
function rowsOf(field: Field, rows: CountRow[], tone: "single" | "ordinal") {
  const labels: Record<string, string> = id.profile.options[field];
  const shown =
    tone === "ordinal" ? rows : rows.filter((r) => r.value > 0).sort((a, b) => b.value - a.value);
  return shown.map((row) => ({
    key: row.key,
    label: labels[row.key] ?? row.key,
    value: row.value,
  }));
}

/** Who is in the sample (questionnaire part B), as small multiples of bar lists. */
export function SampleProfile({ profile, total }: { profile: Profile; total: number }) {
  const copy = id.monitoring.profile;
  return (
    <ChartCard headingId="profil-sampel" title={copy.title} description={copy.body}>
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        {FIELDS.map(({ field, tone }) => (
          <div key={field}>
            <h3 className="mb-3 font-semibold">{id.profile.fields[field].label}</h3>
            <BarList tone={tone} total={total} rows={rowsOf(field, profile[field], tone)} />
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
