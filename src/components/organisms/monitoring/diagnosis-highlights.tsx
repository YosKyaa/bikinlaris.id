import { BarList } from "@/components/molecules/bar-list";
import { ChartCard } from "@/components/molecules/chart-card";
import type { ProblemId, SectionId } from "@/content/diagnosis";
import { id } from "@/content/id";
import type { CountRow } from "@/lib/data/monitoring";
import { getProblem, getSection } from "@/lib/diagnosis/bank";

interface DiagnosisHighlightsProps {
  hardest: CountRow<SectionId>[];
  problems: CountRow<ProblemId>[];
  packs: number;
}

/** What owners find hardest, and which problems come up most. Nominal: one colour per chart. */
export function DiagnosisHighlights({ hardest, problems, packs }: DiagnosisHighlightsProps) {
  const copy = id.monitoring;
  return (
    <>
      <ChartCard
        headingId="paling-repot"
        title={copy.hardest.title}
        description={copy.hardest.body}
      >
        <BarList
          total={packs}
          rows={hardest.map((row) => ({
            key: row.key,
            label: getSection(row.key).label,
            value: row.value,
          }))}
        />
      </ChartCard>
      <ChartCard
        headingId="masalah-sering"
        title={copy.problems.title}
        description={copy.problems.body(problems.length)}
      >
        <BarList
          total={packs}
          rows={problems.map((row) => ({
            key: row.key,
            label: getProblem(row.key).title,
            value: row.value,
          }))}
        />
      </ChartCard>
    </>
  );
}
