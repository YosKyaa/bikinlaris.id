import type { ComponentProps } from "react";

import { Eyebrow } from "@/components/atoms/eyebrow";
import { EmptyState } from "@/components/molecules/empty-state";
import { id } from "@/content/id";
import type { Business, Pack } from "@/lib/data/types";
import { getProblem, getSop, rules } from "@/lib/diagnosis/bank";
import { dayNumber, formatDate } from "@/lib/format";

import { BusinessMap } from "./business-map";
import { CoachPanel } from "./coach-panel";
import { PackActions, PackStickyActions, PackViewTracker } from "./pack-actions";
import { FirstStepCard, LaterSops, PackStatusCard, PackTips, ProblemList } from "./pack-details";
import { SopDocument } from "./sop-document";
import { SopPackList } from "./sop-pack-list";

interface PackViewProps {
  business: Business;
  pack: Pack;
  locationLabel: string;
  whatsAppUrl: string;
  /** "Tanya coach", or null when the coach is off. */
  coach: ComponentProps<typeof CoachPanel> | null;
}

/** The peak of the journey: calm completion, one clear first step, then the documents. */
export function PackView({ business, pack, locationLabel, whatsAppUrl, coach }: PackViewProps) {
  const documents = pack.sops.map((packSop, index) => {
    const sop = getSop(packSop.sopId);
    const props = {
      sop,
      problems: packSop.problemIds.map(getProblem),
      businessName: business.name,
      whyText: packSop.whyText,
      taskTexts: packSop.taskTexts,
    };
    return { sop, index, props };
  });

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <PackViewTracker />
      <header className="space-y-4 print:hidden">
        <div className="space-y-1">
          <Eyebrow>{id.pack.eyebrow}</Eyebrow>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {id.pack.title(business.name)}
          </h1>
        </div>
        <PackStatusCard
          day={dayNumber(pack.createdOn)}
          totalDays={rules.followUpDays}
          followUpDate={formatDate(pack.followUpOn)}
          code={business.code}
        />
      </header>

      <div className="hidden print:block">
        <p className="text-xl font-bold">{id.pack.printHeader(business.name)}</p>
        <p className="text-sm">
          {id.pack.printMeta(business.product, locationLabel, formatDate(pack.createdOn))}
        </p>
      </div>

      {pack.sops.length === 0 ? (
        <EmptyState title={id.pack.empty.title} body={id.pack.empty.body} />
      ) : (
        <>
          <div className="space-y-4">
            <FirstStepCard sopId={pack.sops[0].sopId} />
            <PackActions whatsAppUrl={whatsAppUrl} />
            <PackTips />
          </div>
          <section aria-labelledby="daftar-sop" className="space-y-4 print:hidden">
            <h2 id="daftar-sop" className="text-2xl font-semibold">
              {id.pack.sops.title(pack.sops.length)}
            </h2>
            <SopPackList
              items={documents.map(({ sop, props }) => ({
                sopId: sop.id,
                title: sop.title,
                goal: sop.goal,
                content: <SopDocument {...props} showHeading={false} variant="screen" />,
              }))}
            />
          </section>
          <div className="hidden space-y-8 print:block">
            {documents.map(({ sop, index, props }) => (
              <SopDocument
                key={sop.id}
                {...props}
                number={index + 1}
                className="break-inside-avoid-page"
              />
            ))}
          </div>
        </>
      )}

      {coach && pack.sops.length > 0 ? <CoachPanel {...coach} /> : null}

      <div className="print:hidden">
        <BusinessMap map={pack.map} hardest={pack.hardestSection} compact>
          <ProblemList problems={pack.problems} />
        </BusinessMap>
      </div>
      <LaterSops sopIds={pack.laterSopIds} />
      {pack.sops.length > 0 ? <PackStickyActions whatsAppUrl={whatsAppUrl} /> : null}
    </div>
  );
}
