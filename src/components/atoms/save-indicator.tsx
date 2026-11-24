import { CircleAlertIcon, CircleCheckIcon, LoaderCircleIcon } from "lucide-react";

import * as id from "@/content/id";
import type { AutosaveStatus } from "@/lib/diagnosis/autosave";
import { cn } from "@/lib/utils";

export type SaveStatus = AutosaveStatus;

const ICONS = {
  idle: CircleCheckIcon,
  saving: LoaderCircleIcon,
  saved: CircleCheckIcon,
  error: CircleAlertIcon,
} as const;

interface SaveIndicatorProps {
  status: SaveStatus;
  /** Shown as "Simpan sekarang" after a failed save (the retry also runs on its own). */
  onRetry?: () => void;
  className?: string;
}

/** Autosave status. Announced politely to screen readers (errors assertively). */
export function SaveIndicator({ status, onRetry, className }: SaveIndicatorProps) {
  const Icon = ICONS[status];
  return (
    <p
      role={status === "error" ? "alert" : "status"}
      aria-live={status === "error" ? "assertive" : "polite"}
      className={cn(
        "inline-flex flex-wrap items-center justify-end gap-x-1.5 gap-y-1 text-sm",
        status === "error" ? "text-destructive" : "text-muted-foreground",
        status === "saved" && "text-success",
        className,
      )}
    >
      <Icon aria-hidden className={cn("size-4 shrink-0", status === "saving" && "animate-spin")} />
      {id.saveIndicator[status]}
      {status === "error" && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 px-1 font-semibold underline underline-offset-4"
        >
          {id.saveIndicator.retry}
        </button>
      ) : null}
    </p>
  );
}
