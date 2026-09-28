import type { Task } from "@/content/diagnosis.types";
import { id } from "@/content/id";

/** A titled group of SOP tasks with printable tick boxes. */
export function TaskList({
  title,
  tasks,
  texts,
}: {
  title: string;
  tasks: Task[];
  /** Personalised task texts by task id (LLM); falls back to the bank text. */
  texts?: Record<string, string> | null;
}) {
  if (tasks.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-muted-foreground">{title}</h4>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-start gap-3">
            <span aria-hidden className="mt-1 size-5 shrink-0 rounded border-2 border-border" />
            <span>
              {texts?.[task.id] ?? task.text}
              {task.kind === "siapkan" ? (
                <span className="ml-1 text-sm text-muted-foreground tabular-nums">
                  · {id.common.minutes(task.minutes)}
                </span>
              ) : null}
              {task.kind !== "siapkan" && task.onlyWhenPresent ? (
                <span className="ml-1 text-sm text-muted-foreground">
                  · {id.pack.sop.onlyWhenPresent}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
