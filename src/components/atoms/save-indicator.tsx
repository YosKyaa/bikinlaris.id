import { CircleAlertIcon, CircleCheckIcon, LoaderCircleIcon } from "lucide-react";

import { id } from "@/content/id";
import { cn } from "@/lib/utils";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const ICONS = {
  idle: CircleCheckIcon,
  saving: LoaderCircleIcon,
  saved: CircleCheckIcon,
  error: CircleAlertIcon,
} as const;

/** Autosave status. Announced politely to screen readers (errors assertively). */
export function SaveIndicator({ status, className }: { status: SaveStatus; className?: string }) {
  const Icon = ICONS[status];
  return (
    <p
      role={status === "error" ? "alert" : "status"}
      aria-live={status === "error" ? "assertive" : "polite"}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm",
        status === "error" ? "text-destructive" : "text-muted-foreground",
        status === "saved" && "text-success",
        className,
      )}
    >
      <Icon aria-hidden className={cn("size-4", status === "saving" && "animate-spin")} />
      {id.saveIndicator[status]}
    </p>
  );
}
