import Link from "next/link";

import { Button } from "@/components/ui/button";
import { id } from "@/content/id";

interface StepActionBarProps {
  backHref: string | null;
  nextLabel: string;
  onNext: () => void;
  pending: boolean;
}

/** "Kembali" + primary action. Sticky in the thumb zone on mobile, inline on larger screens. */
export function StepActionBar({ backHref, nextLabel, onNext, pending }: StepActionBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:mt-8 sm:border-0 sm:p-0">
      <div className="mx-auto flex max-w-2xl gap-3">
        {backHref ? (
          <Button asChild variant="outline" size="lg" className="flex-1 sm:flex-none">
            <Link href={backHref}>{id.common.back}</Link>
          </Button>
        ) : null}
        <Button
          type="button"
          size="lg"
          className="flex-[2] sm:ml-auto sm:flex-none"
          disabled={pending}
          onClick={onNext}
        >
          {pending ? id.common.saving : nextLabel}
        </Button>
      </div>
    </div>
  );
}
