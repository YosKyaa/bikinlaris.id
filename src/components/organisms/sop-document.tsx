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
  className?: string;
}

/** Full SOP content: why, setup, daily, weekly, 14-day tick table. Print-friendly. */
export function SopDocument({
  sop,
  problems,
  businessName,
  whyText,
  taskTexts,
  showHeading = true,
  number,
  className,
}: SopDocumentProps) {
  const setup = sop.tasks.filter((t) => t.kind === "siapkan");
  const daily = sop.tasks.filter((t) => t.kind === "harian");
  const weekly = sop.tasks.filter((t) => t.kind === "mingguan");
  const why = whyText ?? problems.map((p) => p.rootCause).join(" ");

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

      {problems.length > 0 ? (
        <div className="rounded-lg bg-muted p-4 print:border print:bg-transparent">
          <h4 className="mb-1 text-sm font-semibold text-muted-foreground">
            {id.pack.sop.why(businessName)}
          </h4>
          <p>
            {id.pack.sop.fromAnswers}{" "}
            <strong className="font-semibold">
              {problems.map((p) => p.title.toLowerCase()).join(", ")}
            </strong>
            . {why}
          </p>
        </div>
      ) : null}

      <TaskList title={id.pack.sop.setup} tasks={setup} texts={taskTexts} />
      <TaskList title={id.pack.sop.daily} tasks={daily} texts={taskTexts} />
      <TaskList title={id.pack.sop.weekly} tasks={weekly} texts={taskTexts} />
      <ChecklistGrid rows={daily.map((t) => ({ id: t.id, label: taskTexts?.[t.id] ?? t.text }))} />
    </article>
  );
}
