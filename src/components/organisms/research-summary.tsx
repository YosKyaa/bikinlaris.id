import { StatCard } from "@/components/molecules/stat-card";
import { id } from "@/content/id";
import type { ResearchSummary as Summary } from "@/lib/data/types";

/** Counts computed from data. Questionnaires show "—" until that module exists. */
export function ResearchSummary({ summary }: { summary: Summary }) {
  const copy = id.researcher.stats;
  return (
    <section aria-label={id.researcher.title}>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <li>
          <StatCard label={copy.registered} value={summary.registered} />
        </li>
        <li>
          <StatCard label={copy.diagnosisDone} value={summary.diagnosisDone} />
        </li>
        <li>
          <StatCard label={copy.packsCreated} value={summary.packsCreated} />
        </li>
        <li>
          <StatCard label={copy.pastDay30} value={summary.pastDay30} />
        </li>
        <li>
          <StatCard
            label={copy.questionnaires}
            value={summary.questionnairesIn}
            hint={summary.questionnairesIn === null ? copy.questionnairesNote : undefined}
          />
        </li>
      </ul>
    </section>
  );
}
