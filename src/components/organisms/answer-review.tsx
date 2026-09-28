import Link from "next/link";

import { SectionStatusBadge } from "@/components/atoms/section-status-badge";
import { Button } from "@/components/ui/button";
import type { SectionColor } from "@/content/diagnosis.types";
import { id } from "@/content/id";
import { cn } from "@/lib/utils";

export interface ReviewSection {
  id: string;
  label: string;
  color: SectionColor;
  complete: boolean;
  editHref: string;
  questions: { id: string; text: string; answerLabel: string | null }[];
}

/** Read-only list of all answers per section, each with an "Ubah" link back to the section. */
export function AnswerReview({ sections }: { sections: ReviewSection[] }) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <section
          key={section.id}
          aria-labelledby={`review-${section.id}`}
          className={cn("rounded-xl border p-4 sm:p-5", !section.complete && "border-destructive")}
        >
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={`review-${section.id}`} className="text-lg font-semibold">
              {section.label}
            </h2>
            {section.complete ? <SectionStatusBadge color={section.color} /> : null}
            <Button asChild variant="link" className="ml-auto h-11 px-2">
              <Link href={section.editHref} aria-label={id.summary.edit(section.label)}>
                {section.complete ? id.summary.editShort : id.summary.completeSection}
              </Link>
            </Button>
          </div>
          <dl className="mt-2 divide-y">
            {section.questions.map((question) => (
              <div key={question.id} className="flex items-start justify-between gap-4 py-2">
                <dt className="text-muted-foreground">{question.text}</dt>
                <dd
                  className={cn(
                    "shrink-0 font-semibold",
                    question.answerLabel ? "text-foreground" : "text-destructive",
                  )}
                >
                  {question.answerLabel ?? id.answers.unanswered}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
