import { ChevronDownIcon } from "lucide-react";
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

/**
 * All answers, folded per section: six short rows to scan, tap one to see its answers and a
 * link back to change them. An unfinished section starts open, so it cannot be missed.
 */
export function AnswerReview({ sections }: { sections: ReviewSection[] }) {
  return (
    <ul className="divide-y rounded-xl border bg-background shadow-card">
      {sections.map((section) => (
        <li key={section.id}>
          <details className="group" open={!section.complete}>
            <summary
              className={cn(
                "flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden",
                !section.complete && "text-destructive",
              )}
            >
              <span className="min-w-0 flex-1 font-semibold">{section.label}</span>
              {section.complete ? <SectionStatusBadge color={section.color} /> : null}
              <ChevronDownIcon
                aria-hidden
                className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <div className="px-4 pb-3">
              <dl className="divide-y">
                {section.questions.map((question) => (
                  <div key={question.id} className="flex items-start justify-between gap-4 py-2">
                    <dt className="text-sm text-muted-foreground">{question.text}</dt>
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
              <Button asChild variant="outline" className="mt-2 h-11 w-full sm:w-auto">
                <Link href={section.editHref} aria-label={id.summary.edit(section.label)}>
                  {section.complete ? id.summary.editShort : id.summary.completeSection}
                </Link>
              </Button>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
