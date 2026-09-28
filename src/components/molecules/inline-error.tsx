import { CircleAlertIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Human error message: what happened + what to do. Announced immediately. */
export function InlineError({
  message,
  id,
  className,
}: {
  message: string | null | undefined;
  id?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className={cn("flex items-start gap-2 font-medium text-destructive", className)}
    >
      <CircleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
