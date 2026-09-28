import { AreaScoreBar } from "@/components/molecules/area-score-bar";
import type { SectionId } from "@/content/diagnosis";
import { id } from "@/content/id";
import type { BusinessMap as BusinessMapData } from "@/lib/data/types";
import { getSection, questionsOf, rules, sections, totalQuestions } from "@/lib/diagnosis/bank";
import { compareSections } from "@/lib/diagnosis/scoring";

/** "Peta usaha": one AreaScoreBar per section, ordered by pack priority. */
export function BusinessMap({ map, hardest }: { map: BusinessMapData; hardest: SectionId }) {
  const ordered = sections.map((s) => s.id).sort(compareSections(map, hardest));
  return (
    <section
      aria-labelledby="peta-usaha"
      className="rounded-xl border bg-background p-5 shadow-card sm:p-6"
    >
      <h2 id="peta-usaha" className="text-2xl font-semibold">
        {id.pack.map.title}
      </h2>
      <p className="mt-1 text-muted-foreground">{id.pack.map.body(totalQuestions)}</p>
      <ul className="mt-6 space-y-6">
        {ordered.map((sectionId) => (
          <li key={sectionId}>
            <AreaScoreBar
              label={getSection(sectionId).label}
              score={map[sectionId].score}
              max={questionsOf(sectionId).length * rules.redPoints}
              color={map[sectionId].color}
              redCount={map[sectionId].redCount}
              hardest={sectionId === hardest}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
