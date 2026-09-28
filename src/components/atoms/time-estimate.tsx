import { ClockIcon } from "lucide-react";

import { id } from "@/content/id";
import { cn } from "@/lib/utils";

/** "Sekitar 10 menit" with a clock icon. */
export function TimeEstimate({ minutes, className }: { minutes: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-sm text-muted-foreground", className)}
    >
      <ClockIcon aria-hidden className="size-4" />
      {id.common.aboutMinutes(minutes)}
    </span>
  );
}
