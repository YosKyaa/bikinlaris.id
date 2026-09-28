import { Eyebrow } from "@/components/atoms/eyebrow";
import { id } from "@/content/id";
import { sections, sopsOf } from "@/lib/diagnosis/bank";

import { SampleSopDialog } from "../sample-sop-dialog";
import { LANDING_ANCHORS } from "../site-header";
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
    <section id={LANDING_ANCHORS.pack} className="scroll-mt-20 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 *:min-w-0 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:py-24">
        <div className="reveal">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">{copy.title}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{copy.body}</p>
          <SampleSopDialog label={copy.openSample} className="mt-6" />
        </div>
        <SopCatalog sections={catalog} />
      </div>
    </section>
  );
}
