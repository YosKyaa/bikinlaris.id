import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Short label above a heading. Primary green on light backgrounds, lime on --brand-deep. */
export function Eyebrow({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "inverse";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-sm font-semibold",
        tone === "inverse" ? "text-accent-lime" : "text-primary",
        className,
      )}
    >
      {children}
    </p>
  );
}
