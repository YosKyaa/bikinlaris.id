"use client";

import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** "asc" | "desc" | false, as TanStack Table reports it. */
export type SortState = "asc" | "desc" | false;

export const ariaSort = (state: SortState) =>
  state === "asc" ? "ascending" : state === "desc" ? "descending" : "none";

/** Column header that sorts on click: arrow up/down when sorted, a neutral mark otherwise. */
export function SortHeader({
  label,
  state,
  onToggle,
  sortLabel,
  align = "left",
}: {
  label: string;
  state: SortState;
  onToggle: () => void;
  /** Screen-reader name, e.g. "Urutkan menurut Pemilik". */
  sortLabel: string;
  align?: "left" | "right";
}) {
  const Icon =
    state === "asc" ? ArrowUpIcon : state === "desc" ? ArrowDownIcon : ChevronsUpDownIcon;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={sortLabel}
      className={cn(
        "-mx-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 font-semibold transition-colors duration-150 hover:bg-background hover:text-foreground",
        state ? "text-foreground" : "text-muted-foreground",
        align === "right" && "flex-row-reverse",
      )}
    >
      {label}
      <Icon aria-hidden className={cn("size-4 shrink-0", !state && "opacity-60")} />
    </button>
  );
}
