import Link from "next/link";

import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { ROUTES } from "@/lib/auth/constants";
import { ALL, FILTER_PARAMS, type MonitoringFilters as Filters } from "@/lib/data/monitoring";
import { LOCATIONS } from "@/lib/validations/business";

interface MonitoringFiltersProps {
  filters: Filters;
  members: { id: string; label: string }[];
  shown: number;
  total: number;
}

const SELECT_CLASS =
  "h-11 min-w-44 rounded-lg border bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-ring";

/**
 * One filter row above everything it scopes. A plain GET form: works without JavaScript and
 * the filtered view can be shared as a link.
 */
export function MonitoringFilters({ filters, members, shown, total }: MonitoringFiltersProps) {
  const copy = id.monitoring.filters;
  const filtered = filters.location !== ALL || filters.staffId !== ALL;

  return (
    <form
      method="get"
      action={ROUTES.monitoring}
      aria-label={copy.label}
      className="flex flex-col gap-3 rounded-xl bg-muted p-4 sm:flex-row sm:flex-wrap sm:items-end print:hidden"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {copy.location}
        <select
          name={FILTER_PARAMS.location}
          defaultValue={filters.location}
          className={SELECT_CLASS}
        >
          <option value={ALL}>{copy.all}</option>
          {LOCATIONS.map((location) => (
            <option key={location} value={location}>
              {id.profile.options.location[location]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {copy.staff}
        <select name={FILTER_PARAMS.staff} defaultValue={filters.staffId} className={SELECT_CLASS}>
          <option value={ALL}>{copy.all}</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        <Button type="submit" variant="outline" className="h-11 bg-background">
          {copy.apply}
        </Button>
        {filtered ? (
          <Button asChild variant="ghost" className="h-11">
            <Link href={ROUTES.monitoring}>{copy.reset}</Link>
          </Button>
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground sm:ml-auto sm:self-center">
        {copy.showing(shown, total)}
      </p>
    </form>
  );
}
