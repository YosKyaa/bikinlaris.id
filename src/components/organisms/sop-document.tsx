import { ChevronDownIcon, PrinterIcon } from "lucide-react";

import { ChecklistGrid } from "@/components/molecules/checklist-grid";
import { TaskList } from "@/components/molecules/task-list";
import type { Problem, Sop } from "@/content/diagnosis.types";
import { id } from "@/content/id";
import { cn } from "@/lib/utils";

interface SopDocumentProps {
  sop: Sop;
  /** Problems (from the user's answers) this SOP addresses. */
  problems: Problem[];
  businessName: string;
  /** Personalised "kenapa" (LLM). Falls back to the bank root causes. */
  whyText?: string | null;
  taskTexts?: Record<string, string> | null;
  /** Hide the heading when an accordion trigger already shows it. */
  showHeading?: boolean;
  number?: number;
  /**
   * "full": everything, for print and the sample dialog. "screen": the owner's phone view, where
   * the tasks come first, the why folds away and the 14-day tick table stays on paper.
   */
  variant?: "full" | "screen";
  className?: string;
}

function WhyText({ problems, why }: { problems: Problem[]; why: string }) {
  return (
    <p>
      {id.pack.sop.fromAnswers}{" "}
      <strong className="font-semibold">
        {problems.map((p) => p.title.toLowerCase()).join(", ")}
      </strong>
      . {why}
    </p>
  );
}

/** SOP content: why, setup, daily, weekly, and (full variant) the 14-day tick table. */
export function SopDocument({
  sop,
  problems,
  businessName,
  whyText,
  taskTexts,
  showHeading = true,
  number,
  variant = "full",
  className,
}: SopDocumentProps) {
  const setup = sop.tasks.filter((t) => t.kind === "siapkan");
  const daily = sop.tasks.filter((t) => t.kind === "harian");
  const weekly = sop.tasks.filter((t) => t.kind === "mingguan");
  const why = whyText ?? problems.map((p) => p.rootCause).join(" ");
  const screen = variant === "screen";

  return (
    <article className={cn("space-y-5", className)}>
      {showHeading ? (
        <header>
          {number ? (
            <p className="text-sm font-semibold text-primary">{id.pack.sops.number(number)}</p>
          ) : null}
          <h3 className="text-xl font-semibold">{sop.title}</h3>
          <p className="text-muted-foreground">{sop.goal}</p>
        </header>
      ) : null}

      {problems.length > 0 && !screen ? (
        <div className="rounded-lg bg-muted p-4 print:border print:bg-transparent">
          <h4 className="mb-1 text-sm font-semibold text-muted-foreground">
            {id.pack.sop.why(businessName)}
          </h4>
          <WhyText problems={problems} why={why} />
        </div>
      ) : null}

      <TaskList title={id.pack.sop.setup} tasks={setup} texts={taskTexts} />
      <TaskList title={id.pack.sop.daily} tasks={daily} texts={taskTexts} />
      <TaskList title={id.pack.sop.weekly} tasks={weekly} texts={taskTexts} />

      {screen ? (
        <>
          {problems.length > 0 ? (
            <details className="group rounded-lg bg-muted">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 font-medium [&::-webkit-details-marker]:hidden">
                {id.pack.sop.whyToggle}
                <ChevronDownIcon
                  aria-hidden
                  className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <div className="px-4 pb-4">
                <WhyText problems={problems} why={why} />
              </div>
            </details>
          ) : null}
          {daily.length > 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <PrinterIcon aria-hidden className="size-4 shrink-0" />
              {id.pack.sop.printOnlyGrid}
            </p>
          ) : null}
        </>
      ) : (
        <ChecklistGrid
          rows={daily.map((t) => ({ id: t.id, label: taskTexts?.[t.id] ?? t.text }))}
        />
      )}
    </article>
  );
}
