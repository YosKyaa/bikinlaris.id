import type { ComponentProps } from "react";

import { BentoGrid, BentoTile } from "@/components/atoms/bento-tile";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { EmptyState } from "@/components/molecules/empty-state";
import { id } from "@/content/id";
import type { Business, Pack } from "@/lib/data/types";
import { getProblem, getSop, rules } from "@/lib/diagnosis/bank";
import { dayNumber, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

import { BusinessMap } from "./business-map";
import { CoachWidget } from "./coach-widget";
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
  coach: ComponentProps<typeof CoachWidget> | null;
}

/**
 * The peak of the journey, as a bento: the title, the first step (--brand-deep) beside the
 * 30-day status, the two share actions, then the documents and the business map.
 */
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
  const hasSops = pack.sops.length > 0;

  return (
    // Room at the bottom for the phone action bar, and for the floating coach button when on.
    <div className={cn("space-y-6 sm:space-y-8", coach ? "pb-40 lg:pb-24" : "pb-20 lg:pb-0")}>
      <PackViewTracker />
      <BentoGrid className="sm:grid-cols-2 print:hidden">
        <BentoTile tone="mint" as="header" className="p-6 sm:col-span-2 sm:p-8">
          <Eyebrow tone="chip">{id.pack.eyebrow}</Eyebrow>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {id.pack.title(business.name)}
          </h1>
        </BentoTile>
        {hasSops ? <FirstStepCard sopId={pack.sops[0].sopId} /> : null}
        <PackStatusCard
          day={dayNumber(pack.createdOn)}
          totalDays={rules.followUpDays}
          followUpDate={formatDate(pack.followUpOn)}
          code={business.code}
          className={hasSops ? undefined : "sm:col-span-2"}
        />
        {hasSops ? (
          <BentoTile className="space-y-4 sm:col-span-2">
            <PackActions whatsAppUrl={whatsAppUrl} />
            <PackTips />
          </BentoTile>
        ) : null}
      </BentoGrid>

      <div className="hidden print:block">
        <p className="text-xl font-bold">{id.pack.printHeader(business.name)}</p>
        <p className="text-sm">
          {id.pack.printMeta(business.product, locationLabel, formatDate(pack.createdOn))}
        </p>
      </div>

      {!hasSops ? (
        <EmptyState title={id.pack.empty.title} body={id.pack.empty.body} />
      ) : (
        <>
          <section aria-labelledby="daftar-sop" className="space-y-3 sm:space-y-4 print:hidden">
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

      {coach && hasSops ? <CoachWidget {...coach} /> : null}

      <div className="print:hidden">
        <BusinessMap map={pack.map} hardest={pack.hardestSection} compact>
          <ProblemList problems={pack.problems} />
        </BusinessMap>
      </div>
      <LaterSops sopIds={pack.laterSopIds} />
      {hasSops ? <PackStickyActions whatsAppUrl={whatsAppUrl} /> : null}
    </div>
  );
}
