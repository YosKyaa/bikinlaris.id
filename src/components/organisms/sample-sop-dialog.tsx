import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { id } from "@/content/id";
import { getProblem, getSop } from "@/lib/diagnosis/bank";
import { diagnosisBank, type SopId } from "@/content/diagnosis";

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

/** Dialog with the example SOP. The trigger is passed in (button or link styled). */
export function SampleSopDialog({ trigger }: { trigger: ReactNode }) {
  const { sop, problems } = sampleSop();
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {id.landing.pack.sampleTitle}: {sop.title}
          </DialogTitle>
          <DialogDescription>{id.landing.pack.sampleDescription}</DialogDescription>
        </DialogHeader>
        <SopDocument
          sop={sop}
          problems={problems}
          businessName={id.landing.pack.sampleBusiness}
          showHeading={false}
        />
      </DialogContent>
    </Dialog>
  );
}
