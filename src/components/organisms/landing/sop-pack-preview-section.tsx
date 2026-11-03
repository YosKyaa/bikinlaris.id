import { BentoGrid, BentoTile } from "@/components/atoms/bento-tile";
import { id } from "@/content/id";
import { sections, sopsOf } from "@/lib/diagnosis/bank";

import { SampleSopDialog } from "../sample-sop-dialog";
import { LANDING_ANCHORS } from "../site-header";
import { LandingSection, TileHeading } from "./landing-section";
import { SopCatalog, type CatalogSection } from "./sop-catalog";

/** Desire: what is inside the pack, browsable per area, with one SOP that can be opened. */
export function SopPackPreviewSection() {
  const copy = id.landing.pack;
  const catalog: CatalogSection[] = sections.map((section) => ({
    id: section.id,
    label: section.label,
    description: section.description,
    sops: sopsOf(section.id).map((sop) => ({
      id: sop.id,
      title: sop.title,
      goal: sop.goal,
      setup: sop.tasks.filter((t) => t.kind === "siapkan").length,
      daily: sop.tasks.filter((t) => t.kind === "harian").length,
      weekly: sop.tasks.filter((t) => t.kind === "mingguan").length,
    })),
  }));

  return (
    <LandingSection id={LANDING_ANCHORS.pack}>
      <BentoGrid className="lg:grid-cols-[1fr_1.6fr]">
        <BentoTile tone="mint" className="reveal-left flex flex-col">
          <TileHeading eyebrow={copy.eyebrow} title={copy.title} body={copy.body} tone="chip" />
          <SampleSopDialog label={copy.openSample} className="mt-6 self-start lg:mt-auto" />
        </BentoTile>
        <BentoTile className="reveal-right">
          <SopCatalog sections={catalog} />
        </BentoTile>
      </BentoGrid>
    </LandingSection>
  );
}
