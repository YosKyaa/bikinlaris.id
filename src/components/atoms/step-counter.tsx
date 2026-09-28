import { id } from "@/content/id";
import { cn } from "@/lib/utils";

/** "Bagian 2 dari 6" */
export function StepCounter({
  current,
  total,
  className,
}: {
  current: number;
  total: number;
  className?: string;
}) {
  return (
    <p className={cn("text-sm font-semibold text-muted-foreground tabular-nums", className)}>
      {id.stepCounter(current, total)}
    </p>
  );
}
