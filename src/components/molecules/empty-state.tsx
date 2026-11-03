import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Explains why something is empty and offers one next step. */
export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-primary/30 bg-card p-6 text-center",
        className,
      )}
    >
      <p className="font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-muted-foreground">{body}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
