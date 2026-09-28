import { diagnosisBank, type SopId } from "@/content/diagnosis";
import { id } from "@/content/id";
import { getProblem, getSop } from "@/lib/diagnosis/bank";

import { SampleSopTrigger } from "./sample-sop-trigger";
import { SopDocument } from "./sop-document";

/** SOP shown as the public example (landing hero, pack preview). Real bank content. */
export const SAMPLE_SOP_ID: SopId = "satu_pintu_pesanan";

export function sampleSop() {
  const sop = getSop(SAMPLE_SOP_ID);
  const problems = diagnosisBank.problems
    .filter((p) => p.sopId === SAMPLE_SOP_ID)
    .map((p) => getProblem(p.id));
  return { sop, problems };
}

/** Button that opens the example SOP in a dialog (dialog code loads on first click). */
export function SampleSopDialog({
  label,
  size,
  className,
}: {
  label: string;
  size?: "default" | "lg";
  className?: string;
}) {
  const { sop, problems } = sampleSop();
  return (
    <SampleSopTrigger
      label={label}
      size={size}
      className={className}
      title={`${id.landing.pack.sampleTitle}: ${sop.title}`}
      description={id.landing.pack.sampleDescription}
    >
      <SopDocument
        sop={sop}
        problems={problems}
        businessName={id.landing.pack.sampleBusiness}
        showHeading={false}
      />
    </SampleSopTrigger>
  );
}
