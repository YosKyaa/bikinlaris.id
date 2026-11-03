import { BarList } from "@/components/molecules/bar-list";
import { ChartCard } from "@/components/molecules/chart-card";
import { id } from "@/content/id";
import type { CountRow, SampleProfile as Profile } from "@/lib/data/monitoring";
import { regencyName } from "@/lib/wilayah";

type Field = keyof Profile;

/** Kab/kota shown by name; the rest of Indonesia is summed into one row. */
const TOP_LOCATIONS = 8;

/** Ordered answer scales get the ordinal ramp; locations and sectors are nominal. */
const FIELDS: { field: Field; tone: "single" | "ordinal" }[] = [
  { field: "location", tone: "single" },
  { field: "sector", tone: "single" },
  { field: "yearsRunning", tone: "ordinal" },
  { field: "employees", tone: "ordinal" },
];

/**
 * Ordered scales keep every step (a zero is information). Nominal lists show only the filled
 * options, largest first; locations stop at the top few plus one "N kab/kota lain" row.
 * The CSV keeps every code.
 */
function rowsOf(field: Field, rows: CountRow[], tone: "single" | "ordinal") {
  const label = (key: string): string =>
    field === "location"
      ? regencyName(key)
      : ((id.profile.options[field] as Record<string, string>)[key] ?? key);
  const shown =
    tone === "ordinal" ? rows : rows.filter((r) => r.value > 0).sort((a, b) => b.value - a.value);
  const named = shown.map((row) => ({ key: row.key, label: label(row.key), value: row.value }));
  if (field !== "location" || named.length <= TOP_LOCATIONS) return named;
  const rest = named.slice(TOP_LOCATIONS);
  return [
    ...named.slice(0, TOP_LOCATIONS),
    {
      key: "lain",
      label: id.monitoring.profile.otherPlaces(rest.length),
      value: rest.reduce((sum, row) => sum + row.value, 0),
    },
  ];
}

/** Who is in the sample (questionnaire part B), as small multiples of bar lists. */
export function SampleProfile({ profile, total }: { profile: Profile; total: number }) {
  const copy = id.monitoring.profile;
  return (
    <ChartCard headingId="profil-peserta" title={copy.title} description={copy.body}>
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
