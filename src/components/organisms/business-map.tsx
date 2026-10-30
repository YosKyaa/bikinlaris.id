import type { ReactNode } from "react";

import { AreaScoreBar } from "@/components/molecules/area-score-bar";
import type { SectionId } from "@/content/diagnosis";
import { id } from "@/content/id";
import type { BusinessMap as BusinessMapData } from "@/lib/data/types";
import { getSection, questionsOf, rules, sections } from "@/lib/diagnosis/bank";
import { compareSections } from "@/lib/diagnosis/scoring";

/**
 * "Peta usaha": one bar per section, ordered by pack priority. `compact` (owner's pack page)
 * shows words and colour only. `children` sits under the map (the folded problems list).
 */
export function BusinessMap({
  map,
  hardest,
  compact = false,
  children,
}: {
  map: BusinessMapData;
  hardest: SectionId;
  compact?: boolean;
  children?: ReactNode;
}) {
  const ordered = sections.map((s) => s.id).sort(compareSections(map, hardest));
  return (
    <section aria-labelledby="peta-usaha" className="space-y-4">
      <div className="rounded-xl border bg-background p-5 shadow-card sm:p-6">
        <h2 id="peta-usaha" className="text-2xl font-semibold">
          {id.pack.map.title}
        </h2>
        <p className="mt-1 text-muted-foreground">{id.pack.map.body}</p>
        <ul className="mt-5 space-y-4">
          {ordered.map((sectionId) => (
            <li key={sectionId}>
              <AreaScoreBar
                label={getSection(sectionId).label}
                score={map[sectionId].score}
                max={questionsOf(sectionId).length * rules.redPoints}
                color={map[sectionId].color}
                redCount={map[sectionId].redCount}
                hardest={sectionId === hardest}
                compact={compact}
              />
            </li>
          ))}
        </ul>
      </div>
      {children}
    </section>
  );
}
