import { Eyebrow } from "@/components/atoms/eyebrow";
import { Button } from "@/components/ui/button";
import { id } from "@/content/id";
import { sections, sopsOf } from "@/lib/diagnosis/bank";

import { SampleSopDialog } from "../sample-sop-dialog";
import { LANDING_ANCHORS } from "../site-header";

/** Desire: what is inside the pack, with one SOP that can be opened. */
export function SopPackPreviewSection() {
  const copy = id.landing.pack;
  return (
    <section id={LANDING_ANCHORS.pack} className="scroll-mt-20 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 *:min-w-0 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:py-24">
        <div>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">{copy.title}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{copy.body}</p>
          <SampleSopDialog
            trigger={
              <Button variant="outline" className="mt-6">
                {copy.openSample}
              </Button>
            }
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">{copy.listTitle}</h3>
          <dl className="mt-3 divide-y rounded-xl border">
            {sections.map((section) => (
              <div
                key={section.id}
                className="grid gap-1 p-4 *:min-w-0 sm:grid-cols-[12rem_1fr] sm:gap-4"
              >
                <dt className="font-semibold">{section.label}</dt>
                <dd className="text-muted-foreground">
                  {sopsOf(section.id)
                    .map((sop) => sop.title)
                    .join(" · ")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
